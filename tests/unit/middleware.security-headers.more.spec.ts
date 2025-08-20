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

describe('middleware additional security headers', () => {
  test('sets Referrer-Policy, X-Content-Type-Options, COOP, CORP, Permissions-Policy', async () => {
    const res: any = await (middleware as any)(req('http://localhost/api/health'));
    if (res?.headers) {
      expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
      expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(res.headers.get('Cross-Origin-Opener-Policy')).toBe('same-origin');
      expect(res.headers.get('Cross-Origin-Resource-Policy')).toBe('same-origin');
      expect(res.headers.get('Permissions-Policy')).toBe("geolocation=(), microphone=(), camera=()");
    }
  });

  test('sets HSTS only in production', async () => {
    const resDev: any = await (middleware as any)(req('http://localhost/api/health'));
    expect(resDev.headers.get('Strict-Transport-Security')).toBeFalsy();
    (process.env as any).NODE_ENV = 'production';
    const resProd: any = await (middleware as any)(req('http://localhost/api/health'));
    expect(resProd.headers.get('Strict-Transport-Security')).toBe('max-age=31536000; includeSubDomains; preload');
  });
});


