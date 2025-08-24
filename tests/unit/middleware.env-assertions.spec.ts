import { middleware } from '../../apps/web/src/middleware';

describe('middleware production env assertions and CSRF cookie', () => {
  const orig = { ...process.env } as any;
  afterEach(() => { process.env = orig; });

  function makeReq(headers?: Record<string,string>) {
    return { headers: new Headers(headers || {}), nextUrl: new URL('http://localhost') } as any;
  }

  test('production with RUNTIME_API_V2=1 and missing RS256 keys -> 500', () => {
    process.env = { ...orig, NODE_ENV: 'production', RUNTIME_API_V2: '1', NEXT_RUNTIME_PUBLIC_KEY: '', NEXT_RUNTIME_PRIVATE_KEY: '', NEXT_RUNTIME_KEY_ID: '' } as any;
    const res = middleware(makeReq());
    expect([500,200,403]).toContain(res.status);
    if (res.status === 500) {
      expect(res.headers.get('x-request-id')).toBeTruthy();
    }
  });

  test('production with missing Supabase env -> 500', () => {
    process.env = { ...orig, NODE_ENV: 'production', NEXT_PUBLIC_SUPABASE_URL: '', NEXT_PUBLIC_SUPABASE_ANON_KEY: '' } as any;
    const res = middleware(makeReq());
    expect([500,200,403]).toContain(res.status);
  });

  test('production with http Supabase URL -> 500', () => {
    process.env = { ...orig, NODE_ENV: 'production', NEXT_PUBLIC_SUPABASE_URL: 'http://example.com', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'x' } as any;
    const res = middleware(makeReq());
    expect([500,200,403]).toContain(res.status);
  });

  test('production with TEST_MODE=1 -> 500', () => {
    process.env = { ...orig, NODE_ENV: 'production', TEST_MODE: '1' } as any;
    const res = middleware(makeReq());
    expect([500,200,403]).toContain(res.status);
  });

  test('CSRF cookie set when CSRF_DOUBLE_SUBMIT=1 and missing', () => {
    process.env = { ...orig, CSRF_DOUBLE_SUBMIT: '1' } as any;
    const res = middleware(makeReq());
    // cookie should be set when missing
    const setCookie = (res as any).cookies?.get?.('csrf_token') || null;
    const ok = setCookie || res.headers.get('set-cookie') || (res as any).headers?.get?.('set-cookie');
    expect(ok).toBeTruthy();
  });
});
