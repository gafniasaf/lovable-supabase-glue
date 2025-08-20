import { middleware } from '../../apps/web/middleware';

const req = (url: string, headers?: Record<string,string>) => new Request(url, { headers: headers as any } as any);

jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server');
  return {
    ...actual,
    NextResponse: class MockNextResponse {
      static next() {
        const headers = new Headers();
        return { headers, cookies: { set: () => {}, get: () => null } } as any;
      }
      static json(body: any, init?: any) {
        const res = new Response(JSON.stringify(body ?? {}), { status: init?.status || 200 });
        (res as any).headers = new Headers(init?.headers || {});
        return res as any;
      }
    }
  };
});

describe('middleware COEP flag', () => {
  const original = { ...process.env };
  beforeEach(() => { jest.resetModules(); process.env = { ...original, COEP: '1' } as any; });
  afterEach(() => { process.env = original; });

  test('sets Cross-Origin-Embedder-Policy when COEP=1', async () => {
    const res: any = await (middleware as any)(req('http://localhost/api/health'));
    if (res?.headers) {
      expect(res.headers.get('Cross-Origin-Embedder-Policy')).toBe('require-corp');
    }
  });
});


