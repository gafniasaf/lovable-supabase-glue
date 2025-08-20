import { GET as ActivityGET } from '../../apps/web/src/app/api/reports/activity/route';
import { GET as RetentionGET } from '../../apps/web/src/app/api/reports/retention/route';

function makeGet(url: string, headers?: Record<string, string>) { return new Request(url, { method: 'GET', headers }); }

describe('API /api/reports/activity & /api/reports/retention (TEST_MODE)', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('activity: unauth → 401', async () => {
    const res = await (ActivityGET as any)(makeGet('http://localhost/api/reports/activity'));
    expect(res.status).toBe(401);
  });

  test('retention: unauth → 401', async () => {
    const res = await (RetentionGET as any)(makeGet('http://localhost/api/reports/retention'));
    expect(res.status).toBe(401);
  });

  test('retention returns array of { day, dau } when authed', async () => {
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    const res = await (RetentionGET as any)(makeGet('http://localhost/api/reports/retention'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json)).toBe(true);
  });
});


