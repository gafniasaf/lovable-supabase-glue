import { getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { isTestMode } from "@/lib/testMode";
import { addTestMessage, listTestMessagesByThread, markTestMessageReadForUser, listTestParticipantsByThread, addTestNotification, markAllThreadMessagesReadForUser } from "@/lib/testStore";

export type Message = { id: string; thread_id: string; sender_id: string; body: string; created_at: string; read_at?: string | null };
export type MessageList = Message[];

export type MessagingPort = {
  listMessages(threadId: string, opts?: { offset?: number; limit?: number }): Promise<{ rows: MessageList; total: number }>;
  sendMessage(input: { thread_id: string; sender_id: string; body: string }): Promise<Message>;
  markMessageRead(messageId: string, userId: string): Promise<Message | null>;
  markThreadReadAll(threadId: string, userId: string): Promise<{ ok: true }>;
};

export function getMessagingPort(): MessagingPort {
  const test = isTestMode();
  if (test) {
    return {
      async listMessages(threadId, opts) {
        const all = listTestMessagesByThread(threadId) as any[];
        const offset = Math.max(0, opts?.offset ?? 0);
        const limit = Math.max(1, Math.min(200, opts?.limit ?? 100));
        const rows = all.slice(offset, offset + limit) as MessageList;
        return { rows, total: (all ?? []).length };
      },
      async sendMessage(input) {
        const msg = addTestMessage({ thread_id: input.thread_id, sender_id: input.sender_id, body: input.body });
        const parts = listTestParticipantsByThread(input.thread_id) as any[];
        for (const p of parts) addTestNotification({ user_id: p.user_id, type: 'message:new', payload: { thread_id: msg.thread_id, message_id: msg.id } });
        return msg as Message;
      },
      async markMessageRead(messageId, userId) {
        const updated = markTestMessageReadForUser(messageId, userId);
        return updated as any;
      },
      async markThreadReadAll(threadId, userId) {
        return markAllThreadMessagesReadForUser(threadId, userId);
      }
    };
  }
  return {
    async listMessages(threadId, opts) {
      const supabase = getRouteHandlerSupabase();
      const offset = Math.max(0, opts?.offset ?? 0);
      const limit = Math.max(1, Math.min(200, opts?.limit ?? 100));
      const { count } = await supabase.from('messages').select('id', { count: 'exact' } as any).eq('thread_id', threadId).limit(1);
      const { data, error } = await supabase
        .from('messages')
        .select('id,thread_id,sender_id,body,created_at,read_at')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);
      if (error) throw new Error(error.message);
      return { rows: (data ?? []) as any, total: typeof count === 'number' ? count : 0 };
    },
    async sendMessage(input) {
      const supabase = getRouteHandlerSupabase();
      const { data: row, error } = await supabase
        .from('messages')
        .insert({ thread_id: input.thread_id, sender_id: input.sender_id, body: input.body })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return row as any;
    },
    async markMessageRead(messageId, userId) {
      const supabase = getRouteHandlerSupabase();
      const { error } = await supabase
        .from('message_read_receipts')
        .upsert({ message_id: messageId, user_id: userId }, { onConflict: 'message_id,user_id' } as any)
        .select()
        .single();
      if (error) throw new Error(error.message);
      const { data: msg } = await supabase
        .from('messages')
        .select('id,thread_id,sender_id,body,created_at,read_at')
        .eq('id', messageId)
        .single();
      return (msg ?? null) as any;
    },
    async markThreadReadAll(threadId, userId) {
      const supabase = getRouteHandlerSupabase();
      const { data: msgs, error: mErr } = await supabase.from('messages').select('id').eq('thread_id', threadId);
      if (mErr) throw new Error(mErr.message);
      const ids = (msgs ?? []).map((m: any) => m.id);
      if (ids.length > 0) {
        const rows = ids.map(id => ({ message_id: id, user_id: userId }));
        await supabase.from('message_read_receipts').upsert(rows, { onConflict: 'message_id,user_id' } as any);
      }
      return { ok: true } as const;
    }
  };
}

export function createInProcessMessagingAdapter(): MessagingPort {
  return {
    async listMessages(threadId, opts) {
      const offset = Math.max(0, opts?.offset ?? 0);
      const limit = Math.max(1, Math.min(200, opts?.limit ?? 100));
      const url = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/messages?thread_id=${encodeURIComponent(threadId)}&offset=${offset}&limit=${limit}`;
      const res = await fetch(url, { cache: 'no-store' });
      const rows = await res.json().catch(() => []);
      const total = Number(res.headers.get('x-total-count') || (Array.isArray(rows) ? rows.length : 0));
      return { rows: Array.isArray(rows) ? rows : [], total };
    },
    async sendMessage(input) {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/messages`;
      const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input), cache: 'no-store' });
      return await res.json();
    },
    async markMessageRead(messageId, _userId) {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/messages?id=${encodeURIComponent(messageId)}`;
      const res = await fetch(url, { method: 'PATCH', cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    },
    async markThreadReadAll(threadId, _userId) {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/messages/threads/${encodeURIComponent(threadId)}/read-all`;
      const res = await fetch(url, { method: 'PATCH', cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return { ok: true } as const;
    }
  };
}


