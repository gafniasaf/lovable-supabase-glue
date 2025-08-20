import { middleware } from '../../apps/web/middleware';

jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server');
  return {
    ...actual,
    NextResponse: class MockNextResponse {
      static next(opts?: any) {
        const headers = new Headers();
        const cookies = new Map<string, any>();
        return { headers, cookies: { set: (n: string, v: string) => cookies.set(n, { name: n, value: v }), get: (n: string) => cookies.get(n) || null } } as any;
      }
      static json(body: any, init?: any) {
        const res = new Response(JSON.stringify(body ?? {}), { status: init?.status || 200 });
        (res as any).headers = new Headers(init?.headers || {});
        return res as any;
      }
    }
  };
});

function req(url: string, headers?: Record<string,string>) { return new Request(url, { headers: headers as any } as any); }

describe('middleware security headers', () => {
  const original = { ...process.env };
  beforeEach(() => { jest.resetModules(); process.env = { ...original }; });
  afterEach(() => { process.env = original; });

  test('sets X-Frame-Options: DENY and CSP frame-ancestors none', async () => {
    const res: any = await (middleware as any)(req('http://localhost/api/health'));
    const csp = res.headers.get('Content-Security-Policy') || '';
    expect(res.headers.get('X-Frame-Options')).toBe('DENY');
    expect(csp.includes("frame-ancestors 'none'")) .toBeTruthy();
  });
});


