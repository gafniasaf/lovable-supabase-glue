import { middleware } from '../../apps/web/src/middleware';
import { POST as MessagesPOST } from '../../apps/web/src/app/api/messages/route';

function req(url: string, method = 'POST', headers?: Record<string,string>, body?: any) {
  return new Request(url, { method, headers: headers as any, body: body ? JSON.stringify(body) : undefined } as any);
}

describe('security headers and CSRF origin/referer checks', () => {
  const orig = { ...process.env } as any;
  afterEach(() => { process.env = orig; });

  test('middleware sets core security headers', () => {
    const res = middleware({ headers: new Headers(), nextUrl: new URL('http://localhost') } as any);
    expect(res.headers.get('Content-Security-Policy')).toBeTruthy();
    expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(res.headers.get('X-Frame-Options')).toBe('DENY');
    expect(res.headers.get('Permissions-Policy')).toBeTruthy();
  });

  test('CSRF origin/referer mismatch rejected on non-runtime path', async () => {
    process.env = { ...orig, NEXT_PUBLIC_BASE_URL: 'http://localhost' } as any;
    const headers = { 'x-test-auth': 'student', 'content-type': 'application/json', origin: 'http://evil.test', referer: 'http://evil.test/page' } as any;
    const res = await (MessagesPOST as any)(req('http://localhost/api/messages', 'POST', headers, { thread_id: 't1', body: 'hi' }));
    expect([401,403]).toContain(res.status);
  });
});
