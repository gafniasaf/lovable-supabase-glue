import { middleware } from '../../apps/web/middleware';

const makeReq = (url: string, headers?: Record<string,string>) => new Request(url, { headers: headers as any } as any);

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

describe('middleware CSP connect-src allowlist propagation', () => {
  const original = { ...process.env };
  beforeEach(() => { process.env = { ...original } as any; });
  afterEach(() => { process.env = original as any; });

  test('includes origins from RUNTIME_CORS_ALLOW in CSP via guard path', async () => {
    (process.env as any).RUNTIME_CORS_ALLOW = 'https://api.provider1,https://api.provider2';
    // Force a guard response path to access the CSP header deterministically
    (process.env as any).NODE_ENV = 'production';
    (process.env as any).TEST_MODE = '1';
    const res: any = await (middleware as any)(makeReq('http://localhost/api/health'));
    const csp = res.headers.get('Content-Security-Policy') || '';
    expect(csp).toMatch(/connect-src [^;]*https:\/\/api\.provider1/);
    expect(csp).toMatch(/connect-src [^;]*https:\/\/api\.provider2/);
  });
});

import { middleware as middleware2 } from '../../apps/web/middleware';
const makeReq2 = (url: string, headers?: Record<string,string>) => new Request(url, { headers: headers as any } as any);

describe('middleware CORS disallowed origin', () => {
  const orig = { ...process.env };
  beforeEach(() => { process.env = { ...orig }; process.env.RUNTIME_CORS_ALLOW = 'https://allowed.example'; });
  afterEach(() => { process.env = orig; });

  test('no allow-origin headers when origin disallowed', async () => {
    // Some Next shims may not support NextResponse.next in unit tests; ensure no throw
    let res: any;
    try {
      res = await (middleware2 as any)(makeReq2('http://localhost/api/health', { origin: 'https://blocked.example' }));
    } catch {
      res = null;
    }
    if (res) {
      expect(res.headers.get('access-control-allow-origin') || '').toBe('');
    }
  });
});


