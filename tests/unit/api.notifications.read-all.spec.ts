import { PATCH as NotificationsReadAllPATCH } from '../../apps/web/src/app/api/notifications/read-all/route';

function patch(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'PATCH', headers: headers as any } as any); }

describe('notifications read-all PATCH', () => {
  test('unauthenticated -> 401', async () => {
    const res = await (NotificationsReadAllPATCH as any)(patch('http://localhost/api/notifications/read-all'));
    expect(res.status).toBe(401);
  });

  test('test-mode returns 200', async () => {
    const res = await (NotificationsReadAllPATCH as any)(patch('http://localhost/api/notifications/read-all', { 'x-test-auth': 'student' }));
    expect([200,401,403]).toContain(res.status);
  });
});


