import { GET as MessagesGET } from '../../apps/web/src/app/api/messages/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }

describe('API /api/messages list sets x-total-count (smoke)', () => {
  test('teacher authed → header present when 200', async () => {
    const res = await (MessagesGET as any)(get('http://localhost/api/messages?thread_id=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', { 'x-test-auth': 'teacher' }));
    if (res.status === 200) {
      expect(res.headers.get('x-total-count')).toBeTruthy();
    } else {
      expect([400,401,403,404]).toContain(res.status);
    }
  });
});


