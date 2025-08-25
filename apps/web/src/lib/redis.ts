let client: any = null;

export function getRedis(): any | null {
	if (client !== null) return client;
	// Only use ioredis for direct Redis URLs. Upstash REST URLs are not compatible with ioredis.
	const directRedisUrl = process.env.REDIS_URL || '';
	if (!directRedisUrl) { client = null; return client; }
	// Avoid static require so bundlers (Next.js) don't try to resolve optional dependency.
	try {
		const nodeRequire = (0, eval)("require") as any;
		const IORedis = nodeRequire("ioredis");
		client = new IORedis(directRedisUrl);
		return client;
	} catch {
		client = null; return client;
	}
}

export async function redisSetWithTTL(key: string, ttlSec: number): Promise<boolean> {
	const r = getRedis();
	if (!r) return false;
	try {
		await r.set(key, '1', 'EX', ttlSec, 'NX');
		const exists = await r.get(key);
		return exists === '1';
	} catch { return false; }
}

export async function redisIncrWithWindow(key: string, windowMs: number): Promise<{ count: number; resetAt: number } | null> {
	const r = getRedis();
	if (!r) return null;
	try {
		const ttlSec = Math.max(1, Math.ceil(windowMs / 1000));
		const pipeline = r.multi();
		pipeline.incr(key);
		pipeline.ttl(key);
		const resp = await pipeline.exec();
		const count = Number(resp?.[0]?.[1] ?? 1);
		let ttl = Number(resp?.[1]?.[1] ?? -1);
		if (ttl < 0) {
			await r.expire(key, ttlSec);
			ttl = ttlSec;
		}
		const resetAt = Date.now() + ttl * 1000;
		return { count, resetAt };
	} catch { return null; }
}


