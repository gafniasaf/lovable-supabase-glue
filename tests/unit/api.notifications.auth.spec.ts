import { GET as NotifsGET, PATCH as NotifsPATCH } from '../../apps/web/src/app/api/notifications/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }
function patch(url: string, body: any, headers?: Record<string,string>) { return new Request(url, { method: 'PATCH', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any); }

describe('notifications auth', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('GET requires auth', async () => {
    const res = await (NotifsGET as any)(get('http://localhost/api/notifications'));
    expect(res.status).toBe(401);
  });

  test('PATCH mark-read requires auth', async () => {
    const res = await (NotifsPATCH as any)(patch('http://localhost/api/notifications', { id: 'id', read: true }));
    expect([400,401,403]).toContain(res.status);
  });
});
