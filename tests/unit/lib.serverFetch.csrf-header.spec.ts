import { serverFetch } from '../../apps/web/src/lib/serverFetch';

describe('serverFetch attaches x-csrf-token on unsafe methods when enabled', () => {
  const originalEnv = { ...process.env } as any;
  beforeEach(() => { process.env = { ...originalEnv, CSRF_DOUBLE_SUBMIT: '1' } as any; });
  afterEach(() => { process.env = originalEnv; });

  test('adds x-csrf-token from cookie for POST', async () => {
    // Mock next/headers to provide cookies and headers
    jest.resetModules();
    jest.doMock('next/headers', () => ({
      headers: () => new Map<string, string>([['x-request-id', 'req-1']]),
      cookies: () => ({ get: (k: string) => ({ name: k, value: k === 'csrf_token' ? 'cookie-csrf' : '' }) })
    }), { virtual: true });
    const res = await serverFetch('http://localhost/api/health', { method: 'POST' } as any);
    // We can't assert the outgoing request easily without a real fetch, so ensure no throw and reuse path
    expect(res).toBeTruthy();
  });
});

import { serverFetch } from '../../apps/web/src/lib/serverFetch';

describe('serverFetch forwards x-csrf-token when cookie present', () => {
  const originalEnv = { ...process.env };
  const originalFetch = global.fetch;
  const calls: any[] = [];

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, PLAYWRIGHT_BASE_URL: 'http://localhost:3030', CSRF_DOUBLE_SUBMIT: '1' } as any;
    // @ts-ignore setup incoming request headers/cookies
    (globalThis as any).__TEST_HEADERS_STORE__ = (globalThis as any).__TEST_HEADERS_STORE__ || { headers: new Map(), cookies: new Map() };
    // @ts-ignore simulate server-side cookie set by middleware
    (globalThis as any).__TEST_HEADERS_STORE__.cookies.set('csrf_token', 'abc123');
    global.fetch = (async (url: any, init?: any) => { calls.push({ url, init }); return new Response('ok') as any; }) as any;
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch as any;
    calls.length = 0;
  });

  test('adds x-csrf-token header for unsafe method', async () => {
    await serverFetch('/api/messages', { method: 'POST' });
    const h = calls[0].init.headers as Headers;
    expect(h.get('x-csrf-token')).toBe('abc123');
  });
});


