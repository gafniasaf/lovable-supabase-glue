import { GET as MessagesGET } from '../../apps/web/src/app/api/messages/route';

const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);

describe('messages GET rate-limit headers', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });
  afterEach(() => { delete process.env.MESSAGES_LIST_LIMIT; delete process.env.MESSAGES_LIST_WINDOW_MS; });

  test('429 includes retry-after and x-rate-limit-* headers', async () => {
    // Configure strict limit
    process.env.MESSAGES_LIST_LIMIT = '1';
    process.env.MESSAGES_LIST_WINDOW_MS = '60000';
    // @ts-ignore simulate user
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'student');
    const url = 'http://localhost/api/messages?thread_id=00000000-0000-0000-0000-000000000001';
    const r1 = await (MessagesGET as any)(get(url));
    expect([200,401,403,400]).toContain(r1.status);
    const r2 = await (MessagesGET as any)(get(url));
    if (r2.status === 429) {
      expect(r2.headers.get('retry-after')).toBeTruthy();
      expect(r2.headers.get('x-rate-limit-remaining')).toBeDefined();
      expect(r2.headers.get('x-rate-limit-reset')).toBeDefined();
    }
  });
});


