// @ts-nocheck
import { withRouteTiming } from '../../apps/web/src/server/withRouteTiming';

const mkReq = (url: string, method = 'POST', h: Record<string,string> = {}) => new Request(url, { method, headers: { 'origin': 'http://localhost', 'referer': 'http://localhost/x', ...h } });

describe('withRouteTiming global mutation rate limit', () => {
  const original = process.env;
  beforeEach(() => { process.env = { ...original }; });
  afterEach(() => { process.env = original; });

  test('limit 1 per window -> 200 then 429 with same IP', async () => {
    process.env.GLOBAL_MUTATION_RATE_LIMIT = '1';
    process.env.GLOBAL_MUTATION_RATE_WINDOW_MS = '60000';
    const handler = withRouteTiming(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const h = { 'x-forwarded-for': '1.1.1.1' };
    let res = await (handler as any)(mkReq('http://localhost/api/x', 'POST', h) as any);
    expect(res.status).toBe(200);
    res = await (handler as any)(mkReq('http://localhost/api/x', 'POST', h) as any);
    expect(res.status).toBe(429);
    expect(res.headers.get('x-request-id')).toBeTruthy();
  });
});


