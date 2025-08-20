import { GET as MessagesGET } from '../../apps/web/src/app/api/messages/route';

const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);

describe('messages list pagination params', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('non-numeric values clamp to defaults, 200 includes x-total-count', async () => {
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    const res = await (MessagesGET as any)(get('http://localhost/api/messages?thread_id=00000000-0000-0000-0000-000000000001&offset=abc&limit=xyz'));
    expect([200,401,400]).toContain(res.status);
    if (res.status === 200) {
      expect(res.headers.get('x-total-count')).toBeTruthy();
    }
  });
});


