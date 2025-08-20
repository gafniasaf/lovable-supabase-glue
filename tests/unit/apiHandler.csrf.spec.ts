import { createApiHandler } from '../../apps/web/src/server/apiHandler';

function makeReq(origin: string, referer?: string, doubleSubmit?: { cookie: string; header: string }, url: string = 'http://localhost/api/x') {
  const headers = new Headers();
  if (origin) headers.set('origin', origin);
  if (referer) headers.set('referer', referer);
  if (doubleSubmit) {
    headers.set('cookie', `csrf_token=${doubleSubmit.cookie};`);
    headers.set('x-csrf-token', doubleSubmit.header);
  }
  return new Request(url, { method: 'POST', headers, body: JSON.stringify({ a: 1 }) });
}

describe('createApiHandler CSRF', () => {
  test('blocks cross-origin POST with 403 Problem', async () => {
    delete (process.env as any).NEXT_PUBLIC_BASE_URL;
    const handler = createApiHandler({ schema: undefined as any, handler: async () => new Response(null, { status: 200 }) });
    const res = await (handler as any)(makeReq('http://evil.local', 'http://evil.local'));
    expect(res.status).toBe(403);
    expect(res.headers.get('x-request-id')).toBeTruthy();
  });

  test('enforces double-submit CSRF when enabled', async () => {
    (process.env as any).CSRF_DOUBLE_SUBMIT = '1';
    (process.env as any).NEXT_PUBLIC_BASE_URL = 'http://localhost';
    const handler = createApiHandler({ schema: undefined as any, handler: async () => new Response(null, { status: 200 }) });
    // Missing tokens -> 403
    let res = await (handler as any)(makeReq('http://localhost', 'http://localhost'));
    expect(res.status).toBe(403);
    // Mismatch -> 403
    res = await (handler as any)(makeReq('http://localhost', 'http://localhost', { cookie: 'a', header: 'b' }));
    expect(res.status).toBe(403);
    // Match -> 200
    res = await (handler as any)(makeReq('http://localhost', 'http://localhost', { cookie: 'abc', header: 'abc' }));
    expect([200,204]).toContain(res.status);
    delete (process.env as any).CSRF_DOUBLE_SUBMIT;
    delete (process.env as any).NEXT_PUBLIC_BASE_URL;
  });

  test('skips Origin/Referer and double-submit checks for /api/runtime/*', async () => {
    (process.env as any).CSRF_DOUBLE_SUBMIT = '1';
    (process.env as any).NEXT_PUBLIC_BASE_URL = 'http://localhost';
    const handler = createApiHandler({ schema: undefined as any, handler: async () => new Response(null, { status: 200 }) });
    // Cross-origin origin/referer would normally fail, but should pass for runtime path
    const res = await (handler as any)(makeReq('http://evil.local', 'http://evil.local/p', undefined, 'http://localhost/api/runtime/progress'));
    expect([200,204]).toContain(res.status);
    delete (process.env as any).CSRF_DOUBLE_SUBMIT;
    delete (process.env as any).NEXT_PUBLIC_BASE_URL;
  });
});


