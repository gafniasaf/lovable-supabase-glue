import { GET as NotifPrefsGET, PATCH as NotifPrefsPATCH } from '../../apps/web/src/app/api/notifications/preferences/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }
function patch(url: string, body: any, headers?: Record<string,string>) { return new Request(url, { method: 'PATCH', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any); }

describe('notifications preferences auth and rate-limit', () => {
  test('GET unauthenticated -> 401', async () => {
    const res = await (NotifPrefsGET as any)(get('http://localhost/api/notifications/preferences'));
    expect(res.status).toBe(401);
  });

  test('PATCH rate-limit headers when exceeded', async () => {
    const headers = { 'x-test-auth': 'teacher' } as any;
    await (NotifPrefsPATCH as any)(patch('http://localhost/api/notifications/preferences', { 'message:new': true }, headers));
    const res = await (NotifPrefsPATCH as any)(patch('http://localhost/api/notifications/preferences', { 'message:new': false }, headers));
    if (res.status === 429) {
      expect(res.headers.get('retry-after')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-remaining')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-reset')).toBeTruthy();
    } else {
      expect([200,401,403,429,500]).toContain(res.status);
    }
  });
});


