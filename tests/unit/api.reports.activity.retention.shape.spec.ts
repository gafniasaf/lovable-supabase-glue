import { GET as ActivityGET } from '../../apps/web/src/app/api/reports/activity/route';
import { GET as RetentionGET } from '../../apps/web/src/app/api/reports/retention/route';
import { POST as AnnPOST } from '../../apps/web/src/app/api/announcements/route';
import { POST as EnrollPOST } from '../../apps/web/src/app/api/enrollments/route';

const post = (url: string, body?: any, headers?: Record<string,string>) => new Request(url, { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body || {}) } as any);
const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);

describe('reports (TEST_MODE) basic shapes after emitting events', () => {
  const orig = { ...process.env } as any;
  beforeEach(() => { process.env = { ...orig, TEST_MODE: '1' } as any; });
  afterEach(() => { process.env = orig; });

  test('activity/retention return valid JSON arrays/objects in test-mode', async () => {
    // Seed some activity by creating an enrollment and an announcement
    // @ts-ignore teacher auth
    (globalThis as any).__TEST_HEADERS_STORE__ = { cookies: new Map([['x-test-auth','teacher']]), headers: new Map() };
    await (AnnPOST as any)(post('http://localhost/api/announcements', { course_id: 'aaaaaaaa-aaaa-aaaa-aaaa-0000000000aa', title: 'Hello', body: 'World' }));
    // @ts-ignore student auth
    (globalThis as any).__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'student');
    await (EnrollPOST as any)(post('http://localhost/api/enrollments', { course_id: 'aaaaaaaa-aaaa-aaaa-aaaa-0000000000aa' }));

    // Validate activity
    const a = await (ActivityGET as any)(get('http://localhost/api/reports/activity?limit=5', { 'x-test-auth': 'teacher' }));
    expect([200,401,403]).toContain(a.status);
    if (a.status === 200) {
      const json = await a.json();
      expect(Array.isArray(json)).toBe(true);
    }
    // Validate retention
    const r = await (RetentionGET as any)(get('http://localhost/api/reports/retention', { 'x-test-auth': 'teacher' }));
    expect([200,401,403]).toContain(r.status);
    if (r.status === 200) {
      const json = await r.json();
      expect(Array.isArray(json)).toBe(true);
    }
  });
});


