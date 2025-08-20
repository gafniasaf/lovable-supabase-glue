import { redisIncrWithWindow } from "@/lib/redis";
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function checkRateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now >= b.resetAt) {
    const resetAt = now + windowMs;
    const bucket: Bucket = { count: 1, resetAt };
    buckets.set(key, bucket);
    return { allowed: true, remaining: limit - 1, resetAt };
  }
  if (b.count < limit) {
    b.count += 1;
    return { allowed: true, remaining: limit - b.count, resetAt: b.resetAt };
  }
  return { allowed: false, remaining: 0, resetAt: b.resetAt };
}

/** Async variant using Redis when available; falls back to local bucket. */
export async function checkRateLimitAsync(key: string, limit: number, windowMs: number): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const r = await redisIncrWithWindow(`rl:${key}`, windowMs);
  if (r) {
    const { count, resetAt } = r;
    return { allowed: count <= limit, remaining: Math.max(0, limit - count), resetAt };
  }
  return checkRateLimit(key, limit, windowMs);
}


