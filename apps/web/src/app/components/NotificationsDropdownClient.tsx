"use client";
import { useEffect, useState } from "react";
import { createNotificationsGateway } from "@/lib/data";
import { fireToast } from "@/components/ui/Toast";

type Notif = { id: string; type: string; payload?: any; created_at: string; read_at?: string | null };

export default function NotificationsDropdownClient({ initial }: { initial: Notif[] }) {
  const [items, setItems] = useState<Notif[]>(initial || []);
  const [offset, setOffset] = useState<number>(initial?.length || 0);
  const [loadingMore, setLoadingMore] = useState(false);
  const { toasts, push, dismiss } = require("@/components/ui/Toast") as any;

  async function markAll() {
    const prev = items;
    // optimistic: mark all as read locally
    setItems(prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
    try {
      await createNotificationsGateway().markAllRead();
      fireToast("Marked all notifications as read", "success");
      try { window.dispatchEvent(new CustomEvent('notifications:updated')); } catch {}
    } catch {
      // revert on failure
      setItems(prev);
      fireToast("Failed to mark all as read", "error");
    }
  }

  async function loadMore() {
    setLoadingMore(true);
    try {
      const data = await createNotificationsGateway().list(offset, 20);
      if (Array.isArray(data) && data.length > 0) {
        setItems(prev => [...prev, ...data]);
        setOffset(prev => prev + data.length);
      }
    } finally {
      setLoadingMore(false);
    }
  }

  async function markRead(id: string) {
    // optimistic update
    setItems(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    try {
      await createNotificationsGateway().markRead(id);
      fireToast("Marked as read", "success");
      try { window.dispatchEvent(new CustomEvent('notifications:updated')); } catch {}
    } catch {
      // revert on failure
      setItems(prev => prev.map(n => n.id === id ? { ...n, read_at: null } : n));
      fireToast("Failed to mark as read", "error");
    }
  }

  return (
    <div data-testid="notif-list">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium">Notifications</span>
        <button onClick={markAll} className="underline text-xs" title="Mark all read" aria-label="Mark all notifications as read" data-testid="notif-mark-all">Mark all</button>
      </div>
      <ul className="space-y-2">
        {(items || []).slice(0, 100).map(n => (
          <li key={n.id} className="flex items-center justify-between gap-2" data-testid="notif-item">
            <div className={!n.read_at ? '' : 'text-gray-500'}>
              <span>{n.type}</span>
              {n.type === 'submission:graded' && n?.payload?.score != null && (
                <span className="ml-2">Score: {n.payload.score}</span>
              )}
              {n.type === 'message:new' && n?.payload?.thread_id && (
                <a className="ml-2 underline" href={`/labs/system/inbox?thread=${encodeURIComponent(n.payload.thread_id)}`}>Open thread</a>
              )}
            </div>
            {!n.read_at && (
              <button onClick={() => markRead(n.id)} className="underline text-xs" aria-label={`Mark notification ${n.id} as read`} data-testid="notif-read-btn">Read</button>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-2 flex justify-end">
        <button onClick={loadMore} className="underline text-xs" disabled={loadingMore} data-testid="notif-load-more">{loadingMore ? 'Loading…' : 'Load more'}</button>
      </div>
    </div>
  );
}


