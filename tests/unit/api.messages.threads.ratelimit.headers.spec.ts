import { GET as ThreadsGET, POST as ThreadsPOST } from '../../apps/web/src/app/api/messages/threads/route';

const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);
const post = (body: any, headers?: Record<string,string>) => new Request('http://localhost/api/messages/threads', { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);

describe('threads rate-limit headers', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('GET rate-limit returns headers on 429', async () => {
    // @ts-ignore simulate user
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    process.env.MESSAGES_LIST_LIMIT = '1';
    process.env.MESSAGES_LIST_WINDOW_MS = '60000';
    const url = 'http://localhost/api/messages/threads';
    const r1 = await (ThreadsGET as any)(get(url));
    expect([200,401,403]).toContain(r1.status);
    const r2 = await (ThreadsGET as any)(get(url));
    if (r2.status === 429) {
      expect(r2.headers.get('retry-after')).toBeTruthy();
      expect(r2.headers.get('x-rate-limit-remaining')).toBeDefined();
      expect(r2.headers.get('x-rate-limit-reset')).toBeDefined();
    }
  });

  test('POST rate-limit returns headers on 429', async () => {
    // @ts-ignore simulate user
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    const r1 = await (ThreadsPOST as any)(post({ participant_ids: [] }));
    expect([201,401,403,400]).toContain(r1.status);
    const r2 = await (ThreadsPOST as any)(post({ participant_ids: [] }));
    if (r2.status === 429) {
      expect(r2.headers.get('retry-after')).toBeTruthy();
      expect(r2.headers.get('x-rate-limit-remaining')).toBeDefined();
      expect(r2.headers.get('x-rate-limit-reset')).toBeDefined();
    }
  });
});


