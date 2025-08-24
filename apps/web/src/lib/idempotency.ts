import { getRouteHandlerSupabase } from '@/lib/supabaseServer';
import { isTestMode } from '@/lib/testMode';

type Key = { tenantId: string; product: string; userId: string; endpoint: string; key: string };
const mem = new Map<string, any>();

function kstr(k: Key) {
  return `${k.tenantId}:${k.product}:${k.userId}:${k.endpoint}:${k.key}`;
}

export async function getStoredResponse(k: Key): Promise<any | null> {
  if (isTestMode()) {
    return mem.get(kstr(k)) ?? null;
  }
  try {
    const supabase = getRouteHandlerSupabase();
    const { data } = await (supabase as any)
      .from('idempotency_keys')
      .select('response_json')
      .eq('tenant_id', k.tenantId)
      .eq('product', k.product)
      .eq('user_id', k.userId)
      .eq('endpoint', k.endpoint)
      .eq('key', k.key)
      .maybeSingle();
    return (data?.response_json as any) ?? null;
  } catch {
    return null;
  }
}

export async function storeResponse(k: Key, response: any): Promise<void> {
  if (isTestMode()) {
    mem.set(kstr(k), response);
    return;
  }
  try {
    const supabase = getRouteHandlerSupabase();
    await (supabase as any)
      .from('idempotency_keys')
      .upsert({ tenant_id: k.tenantId, product: k.product, user_id: k.userId, endpoint: k.endpoint, key: k.key, response_json: response }, { onConflict: 'tenant_id,product,user_id,endpoint,key' });
  } catch {}
}

import { redisSetWithTTL } from "@/lib/redis";
type Entry = { seenAt: number; ttlMs: number };
const entries = new Map<string, Entry>();

/** Return true if key was seen (and refreshes), otherwise record and return false. */
export function wasSeenAndRecord(key: string, ttlMs = 5 * 60 * 1000): boolean {
  const now = Date.now();
  const e = entries.get(key);
  if (e && now - e.seenAt <= e.ttlMs) {
    return true;
  }
  entries.set(key, { seenAt: now, ttlMs });
  return false;
}

/** Clear expired keys (optional). */
export function sweepExpired(): void {
  const now = Date.now();
  for (const [k, v] of entries.entries()) {
    if (now - v.seenAt > v.ttlMs) entries.delete(k);
  }
}

/** Async variant using Redis when configured; falls back to in-memory. */
export async function wasSeenAndRecordAsync(key: string, ttlMs = 5 * 60 * 1000): Promise<boolean> {
  const ttlSec = Math.max(1, Math.floor(ttlMs / 1000));
  const ok = await redisSetWithTTL(key, ttlSec).catch(() => false);
  if (ok) return false; // newly set (NX) → not seen before
  // Fallback or already present
  return wasSeenAndRecord(key, ttlMs);
}


