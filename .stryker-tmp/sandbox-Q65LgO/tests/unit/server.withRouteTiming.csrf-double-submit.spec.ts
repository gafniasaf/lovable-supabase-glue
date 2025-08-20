// @ts-nocheck
import { withRouteTiming } from '../../apps/web/src/server/withRouteTiming';

const mkReq = (url: string, method = 'POST', h: Record<string,string> = {}) => new Request(url, { method, headers: { ...h } as any } as any);

describe('withRouteTiming CSRF double-submit', () => {
  const original = process.env;
  beforeEach(() => { process.env = { ...original, CSRF_DOUBLE_SUBMIT: '1' } as any; });
  afterEach(() => { process.env = original; });

  test('enforces csrf cookie/header match when enabled', async () => {
    const handler = withRouteTiming(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    // Missing cookie/header
    let res = await (handler as any)(mkReq('http://localhost/api/x', 'POST', { origin: 'http://localhost', referer: 'http://localhost/p' }) as any);
    expect([400,403]).toContain(res.status);
    // Cookie/header mismatch
    res = await (handler as any)(mkReq('http://localhost/api/x', 'POST', { origin: 'http://localhost', referer: 'http://localhost/p', cookie: 'csrf_token=a', 'x-csrf-token': 'b' }) as any);
    expect([400,403]).toContain(res.status);
  });
});


