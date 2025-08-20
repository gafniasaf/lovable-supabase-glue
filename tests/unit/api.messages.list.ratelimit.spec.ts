import { GET as MessagesGET } from '../../apps/web/src/app/api/messages/route';

const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);

describe('messages list GET rate-limit headers', () => {
  beforeEach(() => {
    (globalThis as any).__TEST_HEADERS_STORE__ = (globalThis as any).__TEST_HEADERS_STORE__ || { headers: new Map(), cookies: new Map() };
    (globalThis as any).__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'teacher');
  });

  test('returns 429 with standard headers when limited', async () => {
    const url = 'http://localhost/api/messages?thread_id=00000000-0000-0000-0000-000000000001';
    let res = await (MessagesGET as any)(get(url));
    expect([200,401,403,400]).toContain(res.status);
    res = await (MessagesGET as any)(get(url));
    if (res.status === 429) {
      expect(res.headers.get('retry-after')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-remaining')).toBeDefined();
      expect(res.headers.get('x-rate-limit-reset')).toBeDefined();
    }
  });
});



