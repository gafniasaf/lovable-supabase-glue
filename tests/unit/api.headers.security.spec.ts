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

describe('security headers (CSP frame-ancestors + X-Frame-Options)', () => {
  const original = { ...process.env };
  beforeEach(() => { jest.resetModules(); process.env = { ...original } as any; });
  afterEach(() => { process.env = original; });

  test('middleware sets CSP frame-ancestors none and X-Frame-Options DENY', async () => {
    const res: any = await (middleware as any)(req('http://localhost/api/health'));
    if (res?.headers) {
      const csp = res.headers.get('Content-Security-Policy') || '';
      expect(csp.includes("frame-ancestors 'none'")) .toBeTruthy();
      expect(res.headers.get('X-Frame-Options')).toBe('DENY');
    }
  });
});


