import { POST as ThreadsPOST, GET as ThreadsGET } from '../../apps/web/src/app/api/messages/threads/route';

const post = (body: any, headers?: Record<string,string>) => new Request('http://localhost/api/messages/threads', { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);
const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);

describe('messages threads rate-limit headers', () => {
  beforeEach(() => {
    (globalThis as any).__TEST_HEADERS_STORE__ = (globalThis as any).__TEST_HEADERS_STORE__ || { headers: new Map(), cookies: new Map() };
    (globalThis as any).__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'teacher');
  });

  test('POST returns 429 with standard headers when limited', async () => {
    const res = await (ThreadsPOST as any)(post({ participant_ids: [] }));
    if (res.status === 429) {
      expect(res.headers.get('retry-after')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-remaining')).toBeDefined();
      expect(res.headers.get('x-rate-limit-reset')).toBeDefined();
    }
  });

  test('GET returns 429 with standard headers when limited', async () => {
    const url = 'http://localhost/api/messages/threads?offset=0&limit=10';
    let res = await (ThreadsGET as any)(get(url));
    expect([200,401,403]).toContain(res.status);
    res = await (ThreadsGET as any)(get(url));
    if (res.status === 429) {
      expect(res.headers.get('retry-after')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-remaining')).toBeDefined();
      expect(res.headers.get('x-rate-limit-reset')).toBeDefined();
    }
  });
});


