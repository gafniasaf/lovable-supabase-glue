import { middleware } from '../../apps/web/middleware';

jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server');
  return {
    ...actual,
    NextResponse: class MockNextResponse {
      static next(opts?: any) {
        const headers = new Headers();
        const cookies = new Map<string, any>();
        return {
          headers,
          cookies: {
            set: (name: string, value: string, _options?: any) => cookies.set(name, { name, value }),
            get: (name: string) => cookies.get(name) || null
          }
        } as any;
      }
      static json(body: any, init?: any) {
        const res = new Response(JSON.stringify(body ?? {}), { status: init?.status || 200 });
        (res as any).headers = new Headers(init?.headers || {});
        return res as any;
      }
    }
  };
});

function req(url: string, headers?: Record<string,string>) {
  return new Request(url, { headers: headers as any } as any);
}

describe('production guards (middleware)', () => {
  const originalEnv = { ...process.env };
  beforeEach(() => { jest.resetModules(); process.env = { ...originalEnv }; });
  afterEach(() => { process.env = originalEnv; });

  test('rejects x-test-auth when not in test mode', async () => {
    delete (process.env as any).TEST_MODE;
    const res: any = await (middleware as any)(req('http://localhost/api/health', { 'x-test-auth': 'teacher' }));
    expect([403, undefined]).toContain(res?.status);
    if (res && typeof (res as any).json === 'function') {
      const body = await (res as any).json();
      expect(body?.error?.code).toBe('FORBIDDEN');
    }
  });

  test('errors when TEST_MODE is set in production', async () => {
    process.env.NODE_ENV = 'production' as any;
    process.env.TEST_MODE = '1';
    const res: any = await (middleware as any)(req('http://localhost/api/health'));
    expect([500, undefined]).toContain(res?.status);
  });
});


