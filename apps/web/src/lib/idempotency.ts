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


