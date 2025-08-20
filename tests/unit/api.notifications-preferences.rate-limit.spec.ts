jest.mock('@/lib/rateLimit', () => ({
  checkRateLimit: () => ({ allowed: false, remaining: 0, resetAt: Date.now() + 15_000 })
}), { virtual: true });

import { PATCH as NotifPrefsPATCH } from '../../apps/web/src/app/api/notifications/preferences/route';

const patch = (url: string, body: any, headers?: Record<string,string>) => new Request(url, { method: 'PATCH', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);

describe('notifications/preferences rate-limit headers', () => {
  beforeEach(() => {
    // @ts-ignore simulate auth in test-mode
    (globalThis as any).__TEST_HEADERS_STORE__ = (globalThis as any).__TEST_HEADERS_STORE__ || { headers: new Map(), cookies: new Map() };
    // @ts-ignore
    (globalThis as any).__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'teacher');
    process.env.TEST_MODE = '1';
  });

  test('PATCH returns 429 with standard headers when limited', async () => {
    const res = await (NotifPrefsPATCH as any)(patch('http://localhost/api/notifications/preferences', { 'message:new': false }, { 'x-test-auth': 'teacher' }));
    expect(res.status).toBe(429);
    expect(res.headers.get('retry-after')).toBeTruthy();
    expect(res.headers.get('x-rate-limit-remaining')).toBe('0');
    expect(res.headers.get('x-rate-limit-reset')).toBeTruthy();
  });
});


