import { createApiHandler } from '../../apps/web/src/server/apiHandler';

const mkReq = (url: string, method = 'POST', h: Record<string,string> = {}) => new Request(url, { method, headers: h as any, body: JSON.stringify({ a: 1 }) } as any);

describe('createApiHandler global mutation rate limit headers', () => {
  const original = process.env;
  beforeEach(() => { process.env = { ...original } as any; });
  afterEach(() => { process.env = original; });

  test('second request from same IP returns 429 with standard headers', async () => {
    (process.env as any).GLOBAL_MUTATION_RATE_LIMIT = '1';
    (process.env as any).GLOBAL_MUTATION_RATE_WINDOW_MS = '60000';
    const handler = createApiHandler({ handler: async () => new Response(null, { status: 200 }) });
    const ip = { 'x-forwarded-for': '2.2.2.2', origin: 'http://localhost', referer: 'http://localhost/p' };
    let res = await (handler as any)(mkReq('http://localhost/api/x', 'POST', ip) as any);
    expect([200,204]).toContain(res.status);
    res = await (handler as any)(mkReq('http://localhost/api/x', 'POST', ip) as any);
    expect(res.status).toBe(429);
    expect(res.headers.get('retry-after')).toBeTruthy();
    expect(res.headers.get('x-rate-limit-remaining')).toBe('0');
    expect(res.headers.get('x-rate-limit-reset')).toBeTruthy();
    expect(res.headers.get('x-request-id')).toBeTruthy();
  });
});


