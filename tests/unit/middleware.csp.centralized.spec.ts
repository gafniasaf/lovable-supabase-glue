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

describe('middleware CSP centralized builder', () => {
  const original = { ...process.env } as any;
  beforeEach(() => { process.env = { ...original, NEXT_PUBLIC_CSP: '', RUNTIME_CORS_ALLOW: 'https://api.example, https://cdn.example', RUNTIME_FRAME_SRC_ALLOW: 'https://frame1.example' } as any; });
  afterEach(() => { process.env = original; });

  test('CSP connect-src includes RUNTIME_CORS_ALLOW and frame-src extended by env/header', async () => {
    const res: any = await (middleware as any)(req('http://localhost/', { 'x-frame-allow': 'https://frame2.example' }));
    const csp = res.headers.get('Content-Security-Policy') || '';
    expect(csp).toMatch(/connect-src [^;]*https:\/\/api\.example/);
    expect(csp).toMatch(/connect-src [^;]*https:\/\/cdn\.example/);
    expect(csp).toMatch(/frame-src [^;]*https:\/\/frame1\.example/);
    expect(csp).toMatch(/frame-src [^;]*https:\/\/frame2\.example/);
  });
});


