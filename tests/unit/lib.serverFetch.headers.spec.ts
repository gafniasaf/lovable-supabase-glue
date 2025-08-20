import { serverFetch, fetchJson } from '../../apps/web/src/lib/serverFetch';
import { z } from 'zod';

describe('serverFetch headers and fetchJson', () => {
  const originalEnv = process.env;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    process.env = { ...originalEnv, PLAYWRIGHT_BASE_URL: 'http://localhost:3030' } as any;
    const store: any = (globalThis as any).__TEST_HEADERS_STORE__ || { headers: new Map(), cookies: new Map() };
    store.headers.set('x-request-id', 'rid-123');
    store.cookies.set('x-test-auth', 'teacher');
    (globalThis as any).__TEST_HEADERS_STORE__ = store;
    fetchSpy = jest.spyOn(global as any, 'fetch').mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } }) as any);
  });

  afterEach(() => {
    process.env = originalEnv;
    fetchSpy?.mockRestore();
  });

  test('propagates x-request-id and x-test-auth and builds absolute URL', async () => {
    await serverFetch('/api/health');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(String(url)).toBe('http://localhost:3030/api/health');
    const hdrs = new Headers(init.headers);
    expect(hdrs.get('x-request-id')).toBe('rid-123');
    expect(hdrs.get('x-test-auth')).toBe('teacher');
  });

  test('does not attach x-csrf-token on GET even when cookie present', async () => {
    // simulate csrf cookie in incoming request
    const store: any = (globalThis as any).__TEST_HEADERS_STORE__;
    store.cookies.set('csrf_token', 'tok');
    await serverFetch('/api/health', { method: 'GET' });
    const [, init] = fetchSpy.mock.calls[0];
    const hdrs = new Headers(init.headers);
    expect(hdrs.get('x-csrf-token')).toBeNull();
  });

  test('fetchJson throws with server error code and message', async () => {
    fetchSpy.mockResolvedValueOnce(new Response(JSON.stringify({ error: { code: 'BAD', message: 'oops' } }), { status: 400, headers: { 'content-type': 'application/json' } }) as any);
    await expect(fetchJson('/api/x', z.object({}))).rejects.toThrow('BAD: oops');
  });
});


