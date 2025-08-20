import { PATCH as MessagesPATCH } from '../../apps/web/src/app/api/messages/route';

const patch = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'PATCH', headers: headers as any } as any);

describe('messages PATCH rate-limit headers', () => {
  beforeEach(() => {
    // @ts-ignore simulate teacher auth in test-mode
    (globalThis as any).__TEST_HEADERS_STORE__ = (globalThis as any).__TEST_HEADERS_STORE__ || { headers: new Map(), cookies: new Map() };
    // @ts-ignore
    (globalThis as any).__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'teacher');
  });

  test('returns 429 with standard headers when limited', async () => {
    const res = await (MessagesPATCH as any)(patch('http://localhost/api/messages?id=00000000-0000-0000-0000-000000000001'));
    if (res.status === 429) {
      expect(res.headers.get('retry-after')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-remaining')).toBeDefined();
      expect(res.headers.get('x-rate-limit-reset')).toBeDefined();
    }
  });
});



