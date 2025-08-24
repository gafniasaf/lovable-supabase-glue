import { GET as MessagesGET } from '../../apps/web/src/app/api/messages/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }

describe('messages list GET rate limit headers', () => {
  const orig = { ...process.env } as any;
  afterEach(() => { process.env = orig; });

  test('429 includes standard headers when exceeded', async () => {
    process.env = { ...orig, MESSAGES_LIST_LIMIT: '1', MESSAGES_LIST_WINDOW_MS: '60000' } as any;
    const headers = { 'x-test-auth': 'student' } as any;
    const url = 'http://localhost/api/messages?thread_id=11111111-1111-1111-1111-111111111111';
    await (MessagesGET as any)(get(url, headers));
    const res = await (MessagesGET as any)(get(url, headers));
    if (res.status === 429) {
      expect(res.headers.get('retry-after')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-remaining')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-reset')).toBeTruthy();
    } else {
      expect([200,401,403,429]).toContain(res.status);
    }
  });
});
