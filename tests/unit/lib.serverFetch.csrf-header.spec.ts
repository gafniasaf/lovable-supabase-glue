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


