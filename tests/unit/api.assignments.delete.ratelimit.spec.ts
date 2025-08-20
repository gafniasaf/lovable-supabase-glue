import { DELETE as AssignmentsDELETE } from '../../apps/web/src/app/api/assignments/route';

const del = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'DELETE', headers: headers as any } as any);

jest.mock('@/lib/rateLimit', () => ({
  checkRateLimit: () => ({ allowed: false, remaining: 0, resetAt: Date.now() + 45_000 })
}), { virtual: true });

describe('assignments DELETE rate-limit headers', () => {
  beforeEach(() => {
    // @ts-ignore simulate teacher auth in test-mode
    (globalThis as any).__TEST_HEADERS_STORE__ = (globalThis as any).__TEST_HEADERS_STORE__ || { headers: new Map(), cookies: new Map() };
    // @ts-ignore
    (globalThis as any).__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'teacher');
  });

  test('returns 429 with standard headers when rate-limited', async () => {
    const res = await (AssignmentsDELETE as any)(del('http://localhost/api/assignments?id=00000000-0000-0000-0000-000000000001'));
    expect(res.status).toBe(429);
    expect(res.headers.get('retry-after')).toBeTruthy();
    expect(res.headers.get('x-rate-limit-remaining')).toBe('0');
    expect(res.headers.get('x-rate-limit-reset')).toBeTruthy();
  });
});


