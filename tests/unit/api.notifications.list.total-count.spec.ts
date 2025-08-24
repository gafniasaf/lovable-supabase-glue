import { GET as NotifsGET } from '../../apps/web/src/app/api/notifications/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }

describe('API /api/notifications list sets x-total-count (smoke)', () => {
  test('authed → header present when 200', async () => {
    const res = await (NotifsGET as any)(get('http://localhost/api/notifications', { 'x-test-auth': 'teacher' }));
    if (res.status === 200) {
      expect(res.headers.get('x-total-count')).toBeTruthy();
    } else {
      expect([401]).toContain(res.status);
    }
  });
});


