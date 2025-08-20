import { POST as MessagesPOST } from '../../apps/web/src/app/api/messages/route';

jest.mock('../../apps/web/src/lib/rateLimit', () => ({
  checkRateLimit: () => ({ allowed: false, remaining: 0, resetAt: Date.now() + 30_000 })
}), { virtual: true });

function post(body: any, headers?: Record<string,string>) {
  return new Request('http://localhost/api/messages', { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);
}

describe('messages POST rate limit headers', () => {
  beforeEach(() => {
    // @ts-ignore simulate teacher auth in test-mode
    (globalThis as any).__TEST_HEADERS_STORE__ = (globalThis as any).__TEST_HEADERS_STORE__ || { headers: new Map(), cookies: new Map() };
    // @ts-ignore
    (globalThis as any).__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'teacher');
  });

  test('returns 429 with standard headers when rate-limited', async () => {
    const res = await (MessagesPOST as any)(post({ thread_id: '00000000-0000-0000-0000-000000000001', body: 'hello' }));
    expect(res.status).toBe(429);
    expect(res.headers.get('retry-after')).toBeTruthy();
    expect(res.headers.get('x-rate-limit-reset')).toBeTruthy();
    expect(res.headers.get('x-rate-limit-remaining')).toBe('0');
  });
});


