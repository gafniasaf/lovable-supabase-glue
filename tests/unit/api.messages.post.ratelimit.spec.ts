import { POST as MessagesPOST } from '../../apps/web/src/app/api/messages/route';
import { mockRateLimit, expectRateLimited } from './helpers/rateLimit';

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
    mockRateLimit({ allowed: false, remaining: 0 });
    const res = await (MessagesPOST as any)(post({ thread_id: '00000000-0000-0000-0000-000000000001', body: 'hello' }));
    expectRateLimited(res as any);
  });
});


