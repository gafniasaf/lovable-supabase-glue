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
        ;(res as any).headers = new Headers(init?.headers || {});
        return res as any;
      }
    }
  };
});

function req(url: string, headers?: Record<string, string>) {
  return new Request(url, { headers: headers as any } as any);
}

describe('middleware COEP toggle', () => {
  const originalEnv = { ...process.env } as any;
  beforeEach(() => { jest.resetModules(); process.env = { ...originalEnv, COEP: '1' } as any; });
  afterEach(() => { process.env = originalEnv; });

  test('sets Cross-Origin-Embedder-Policy when COEP=1', async () => {
    const res: any = await (middleware as any)(req('http://localhost/api/health'));
    expect(res.headers.get('Cross-Origin-Embedder-Policy')).toBe('require-corp');
  });
});
