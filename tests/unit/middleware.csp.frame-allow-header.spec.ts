import { middleware } from '../../apps/web/middleware';

jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server');
  return {
    ...actual,
    NextResponse: class MockNextResponse {
      static next(opts?: any) {
        const headers = new Headers();
        const cookies = new Map<string, any>();
        return { headers, cookies: { set: (k: string, v: string) => cookies.set(k, { name: k, value: v }) } } as any;
      }
      static json(body: any, init?: any) {
        const res = new Response(JSON.stringify(body ?? {}), { status: init?.status || 200 });
        (res as any).headers = new Headers(init?.headers || {});
        return res as any;
      }
    }
  };
});

function req(url: string, headers?: Record<string, string>) {
  return new Request(url, { headers: headers as any } as any);
}

describe('middleware CSP frame-src from x-frame-allow header', () => {
  const original = { ...process.env } as any;
  beforeEach(() => { process.env = { ...original, NEXT_PUBLIC_CSP: '', RUNTIME_FRAME_SRC_ALLOW: '' } as any; });
  afterEach(() => { process.env = original; });

  test('extends frame-src when header present', async () => {
    const res: any = await (middleware as any)(req('http://localhost/', { 'x-frame-allow': 'https://frames.example' }));
    const csp = res.headers.get('Content-Security-Policy') || '';
    expect(csp).toMatch(/frame-src [^;]*https:\/\/frames\.example/);
  });
});


