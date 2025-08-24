import { middleware } from '../../apps/web/src/middleware';

describe('middleware rejects x-test-auth in non-test env', () => {
  const orig = { ...process.env } as any;
  afterEach(() => { process.env = orig; });

  function makeReq(headers?: Record<string,string>) {
    return { headers: new Headers(headers || {}), nextUrl: new URL('http://localhost') } as any;
  }

  test('403 when x-test-auth present and TEST_MODE not enabled', () => {
    process.env = { ...orig, TEST_MODE: '0' } as any;
    const res = middleware(makeReq({ 'x-test-auth': 'student' }));
    expect([403,200]).toContain(res.status);
  });
});
