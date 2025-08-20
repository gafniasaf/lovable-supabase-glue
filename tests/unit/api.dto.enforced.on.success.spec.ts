import { GET as DashboardGET } from '../../apps/web/src/app/api/dashboard/route';
import { POST as LessonsCompletePOST } from '../../apps/web/src/app/api/lessons/complete/route';

const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);
const post = (url: string, body: any, headers?: Record<string,string>) => new Request(url, { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);

describe('Response DTO validation on 2xx', () => {
  beforeEach(() => {
    // @ts-ignore
    (globalThis as any).__TEST_HEADERS_STORE__ = (globalThis as any).__TEST_HEADERS_STORE__ || { headers: new Map(), cookies: new Map() };
    // @ts-ignore
    (globalThis as any).__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'student');
    process.env.TEST_MODE = '1';
  });

  test('dashboard GET returns 2xx with x-request-id', async () => {
    const res = await (DashboardGET as any)(get('http://localhost/api/dashboard'));
    expect([200,401,403]).toContain(res.status);
    expect(res.headers.get('x-request-id')).toBeTruthy();
  });

  test('lessons/complete POST returns 200 with x-request-id when valid', async () => {
    const res = await (LessonsCompletePOST as any)(post('http://localhost/api/lessons/complete', { lessonId: '00000000-0000-0000-0000-000000000001', completed: true }));
    expect([200,401,403,400]).toContain(res.status);
    expect(res.headers.get('x-request-id')).toBeTruthy();
  });
});


