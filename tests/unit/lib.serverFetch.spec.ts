import { serverFetch, getBaseUrl } from '../../apps/web/src/lib/serverFetch';

describe('serverFetch utils', () => {
  test('getBaseUrl prefers PLAYWRIGHT_BASE_URL then NEXT_PUBLIC_BASE_URL then localhost', () => {
    const old = { ...process.env } as any;
    delete (process.env as any).PLAYWRIGHT_BASE_URL;
    delete (process.env as any).NEXT_PUBLIC_BASE_URL;
    delete (process.env as any).PORT;
    expect(getBaseUrl()).toMatch(/^http:\/\/localhost:3000$/);
    process.env.NEXT_PUBLIC_BASE_URL = 'http://example.com';
    expect(getBaseUrl()).toBe('http://example.com');
    process.env.PLAYWRIGHT_BASE_URL = 'http://e2e-host';
    expect(getBaseUrl()).toBe('http://e2e-host');
    process.env = old;
  });

  test('PLAYWRIGHT_BASE_URL takes precedence when both set', () => {
    const old = { ...process.env } as any;
    process.env.NEXT_PUBLIC_BASE_URL = 'http://example.com';
    process.env.PLAYWRIGHT_BASE_URL = 'http://e2e-host';
    expect(getBaseUrl()).toBe('http://e2e-host');
    process.env = old;
  });

  test('serverFetch builds absolute URL and propagates headers when given path', async () => {
    const old = global.fetch;
    const calls: any[] = [];
    // @ts-ignore
    global.fetch = async (url: any, init?: any) => { calls.push({ url, init }); return new Response('ok'); };
    try {
      delete (process.env as any).NEXT_PUBLIC_BASE_URL;
      delete (process.env as any).PLAYWRIGHT_BASE_URL;
      (process.env as any).PORT = '3333';
      await serverFetch('/api/ping', { headers: { 'x-request-id': 'in' } });
      expect(calls[0].url).toBe('http://localhost:3333/api/ping');
      expect((calls[0].init.headers as Headers).get('x-request-id')).toBe('in');
    } finally {
      global.fetch = old;
    }
  });

  test('serverFetch injects x-test-auth from cookies when header missing', async () => {
    const old = global.fetch;
    const calls: any[] = [];
    // @ts-ignore
    global.fetch = async (url: any, init?: any) => { calls.push({ url, init }); return new Response('ok'); };
    try {
      // simulate cookie via our jest.setup mock store
      // @ts-ignore
      globalThis.__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'teacher');
      await serverFetch('http://example.com/api/secure');
      expect((calls[0].init.headers as Headers).get('x-test-auth')).toBe('teacher');
    } finally {
      global.fetch = old;
    }
  });

  test('serverFetch forwards upstream x-request-id from Next headers when not provided', async () => {
    const old = global.fetch;
    const calls: any[] = [];
    // @ts-ignore
    global.fetch = async (url: any, init?: any) => { calls.push({ url, init }); return new Response('ok'); };
    try {
      // set upstream header via mocked next/headers store
      // @ts-ignore
      globalThis.__TEST_HEADERS_STORE__.headers.set('x-request-id', 'upstream-1');
      await serverFetch('/api/test');
      const h = calls[0].init.headers as Headers;
      expect(h.get('x-request-id')).toBe('upstream-1');
    } finally {
      global.fetch = old;
    }
  });
});


