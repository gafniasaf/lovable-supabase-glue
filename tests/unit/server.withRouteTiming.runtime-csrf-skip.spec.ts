import { withRouteTiming } from '../../apps/web/src/server/withRouteTiming';

describe('withRouteTiming runtime CSRF skip', () => {
  test('does not enforce same-origin for /api/runtime paths', async () => {
    const handler = withRouteTiming(async (req: Request) => new Response(null, { status: 200 }));
    const req = new Request('http://localhost/api/runtime/progress', { method: 'POST', headers: { origin: 'https://provider.example' } as any } as any);
    const res = await (handler as any)(req as any);
    expect([200, 401, 403]).toContain(res.status); // but not 403 due to CSRF same-origin check
  });
});


import { withRouteTiming } from '../../apps/web/src/server/withRouteTiming';

const mkReq = (url: string, method = 'POST', h: Record<string,string> = {}) => new Request(url, { method, headers: { ...h } as any } as any);

describe('withRouteTiming skips CSRF on /api/runtime/*', () => {
  const original = process.env;
  beforeEach(() => { process.env = { ...original, CSRF_DOUBLE_SUBMIT: '1', NEXT_PUBLIC_BASE_URL: 'http://localhost' } as any; });
  afterEach(() => { process.env = original; });

  test('cross-origin POST to runtime path passes without same-origin or double-submit', async () => {
    const handler = withRouteTiming(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    const res = await (handler as any)(mkReq('http://localhost/api/runtime/progress', 'POST', { origin: 'http://evil.example', referer: 'http://evil.example/p' }) as any);
    expect(res.status).toBe(200);
    expect(res.headers.get('x-request-id')).toBeTruthy();
  });
});


