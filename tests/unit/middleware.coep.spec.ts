import { middleware } from '../../apps/web/src/middleware';

describe('COEP header behavior', () => {
  const orig = { ...process.env } as any;
  afterEach(() => { process.env = orig; });

  function makeReq(headers?: Record<string,string>) {
    return { headers: new Headers(headers || {}), nextUrl: new URL('http://localhost') } as any;
  }

  test('COEP header absent by default', () => {
    process.env = { ...orig, COEP: '0' } as any;
    const res = middleware(makeReq());
    expect(res.headers.get('Cross-Origin-Embedder-Policy')).toBeNull();
  });

  test('COEP header present when enabled', () => {
    process.env = { ...orig, COEP: '1' } as any;
    const res = middleware(makeReq());
    expect(res.headers.get('Cross-Origin-Embedder-Policy')).toBe('require-corp');
  });
});
