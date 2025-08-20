import { withRouteTiming } from '../../apps/web/src/server/withRouteTiming';

const mkReq = (url: string, method = 'POST', h: Record<string,string> = {}) => new Request(url, { method, headers: { ...h } as any } as any);

describe('withRouteTiming CSRF and double-submit token', () => {
  const original = process.env;
  beforeEach(() => { process.env = { ...original }; });
  afterEach(() => { process.env = original; });

  test('rejects cross-origin POST with 403', async () => {
    const handler = withRouteTiming(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const bad = await (handler as any)(mkReq('http://localhost/api/x', 'POST', { origin: 'http://evil', referer: 'http://evil/p' }) as any);
    expect(bad.status).toBe(403);
  });

  test('double-submit token enforced when enabled', async () => {
    process.env.CSRF_DOUBLE_SUBMIT = '1';
    process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost';
    const handler = withRouteTiming(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    // Missing tokens -> 403
    let res = await (handler as any)(mkReq('http://localhost/api/x', 'POST', { origin: 'http://localhost', referer: 'http://localhost/x' }) as any);
    expect(res.status).toBe(403);
    // Mismatched tokens -> 403
    res = await (handler as any)(mkReq('http://localhost/api/x', 'POST', { origin: 'http://localhost', referer: 'http://localhost/x', 'x-csrf-token': 'a', cookie: 'csrf_token=b' }) as any);
    expect(res.status).toBe(403);
    // Matching tokens -> 200
    res = await (handler as any)(mkReq('http://localhost/api/x', 'POST', { origin: 'http://localhost', referer: 'http://localhost/x', 'x-csrf-token': 't', cookie: 'csrf_token=t' }) as any);
    expect(res.status).toBe(200);
    expect(res.headers.get('x-request-id')).toBeTruthy();
  });
});


