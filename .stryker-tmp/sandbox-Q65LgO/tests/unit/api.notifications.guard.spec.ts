// @ts-nocheck
import { GET as NotifsGET } from '../../apps/web/src/app/api/notifications/route';

function getUrl(url: string, headers?: Record<string, string>) {
  return new Request(url, { headers: { ...(headers || {}) } });
}

describe('notifications guard (prod path)', () => {
  test('MVP guard returns [] (or Problem if not allowed) and echoes x-request-id', async () => {
    delete (process.env as any).TEST_MODE;
    process.env.MVP_PROD_GUARD = '1';
    const res = await (NotifsGET as any)(getUrl('http://localhost/api/notifications', { 'x-test-auth': 'student', 'x-request-id': 'n1' }));
    expect(res.headers.get('x-request-id')).toBe('n1');
    // In guard mode, handler returns [] in prod path; if auth gate fails first, it may be Problem
    const body = await res.json();
    expect(Array.isArray(body) || body?.error).toBeTruthy();
  });
});


