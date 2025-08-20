jest.mock('@/lib/rateLimit', () => ({
  checkRateLimit: (key: string) => key.includes('list') ? ({ allowed: false, remaining: 0, resetAt: Date.now() + 20_000 }) : ({ allowed: false, remaining: 0, resetAt: Date.now() + 10_000 })
}), { virtual: true });

import { GET as NotifGET, PATCH as NotifPATCH } from '../../apps/web/src/app/api/notifications/route';

const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);
const patch = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'PATCH', headers: headers as any } as any);

describe('notifications rate-limit headers', () => {
  beforeEach(() => {
    // @ts-ignore simulate auth
    (globalThis as any).__TEST_HEADERS_STORE__ = (globalThis as any).__TEST_HEADERS_STORE__ || { headers: new Map(), cookies: new Map() };
    // @ts-ignore
    (globalThis as any).__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'teacher');
  });

  test('GET list returns 429 with standard headers when limited', async () => {
    const res = await (NotifGET as any)(get('http://localhost/api/notifications'));
    expect(res.status).toBe(429);
    expect(res.headers.get('retry-after')).toBeTruthy();
    expect(res.headers.get('x-rate-limit-remaining')).toBe('0');
    expect(res.headers.get('x-rate-limit-reset')).toBeTruthy();
  });

  test('PATCH mark read returns 429 with standard headers when limited', async () => {
    const res = await (NotifPATCH as any)(patch('http://localhost/api/notifications?id=abc'));
    expect(res.status).toBe(429);
    expect(res.headers.get('retry-after')).toBeTruthy();
    expect(res.headers.get('x-rate-limit-remaining')).toBe('0');
    expect(res.headers.get('x-rate-limit-reset')).toBeTruthy();
  });
});


