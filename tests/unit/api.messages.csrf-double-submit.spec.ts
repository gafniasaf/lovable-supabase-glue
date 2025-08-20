import { POST as MessagesPOST } from '../../apps/web/src/app/api/messages/route';

function post(body: any, headers?: Record<string, string>) {
  return new Request('http://localhost/api/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(headers || {}) } as any,
    body: JSON.stringify(body)
  } as any);
}

describe('api.messages CSRF double-submit enforcement', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, TEST_MODE: '1', NEXT_PUBLIC_BASE_URL: 'http://localhost', CSRF_DOUBLE_SUBMIT: '1' } as any;
    // @ts-ignore ensure authenticated test user via next/headers mock
    (globalThis as any).__TEST_HEADERS_STORE__ = (globalThis as any).__TEST_HEADERS_STORE__ || { cookies: new Map(), headers: new Map() };
    // @ts-ignore simulate teacher auth
    (globalThis as any).__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'teacher');
  });

  afterEach(() => {
    process.env = originalEnv;
    try {
      // @ts-ignore
      (globalThis as any).__TEST_HEADERS_STORE__?.cookies?.clear?.();
      // @ts-ignore
      (globalThis as any).__TEST_HEADERS_STORE__?.headers?.clear?.();
    } catch {}
  });

  test('403 when CSRF tokens missing or mismatched; 201 when matched', async () => {
    const payload = { thread_id: '00000000-0000-0000-0000-000000000001', body: 'hello' };
    // Missing tokens -> 403
    let res = await (MessagesPOST as any)(post(payload, { origin: 'http://localhost', referer: 'http://localhost/x' }));
    expect(res.status).toBe(403);
    // Mismatched tokens -> 403
    res = await (MessagesPOST as any)(post(payload, { origin: 'http://localhost', referer: 'http://localhost/x', cookie: 'csrf_token=a', 'x-csrf-token': 'b' }));
    expect(res.status).toBe(403);
    // Matching tokens -> 201
    res = await (MessagesPOST as any)(post(payload, { origin: 'http://localhost', referer: 'http://localhost/x', cookie: 'csrf_token=t', 'x-csrf-token': 't' }));
    expect([200, 201]).toContain(res.status);
  });
});


