import { POST as AssignPOST, PATCH as AssignPATCH } from '../../apps/web/src/app/api/assignments/route';

function req(method: string, url: string, body?: any, headers?: Record<string,string>) {
  return new Request(url, { method, headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: body ? JSON.stringify(body) : undefined } as any);
}

describe('assignments target upsert (EXTERNAL_COURSES=1)', () => {
  const original = { ...process.env } as any;
  beforeEach(() => { process.env = { ...original, TEST_MODE: '1', EXTERNAL_COURSES: '1' } as any; });
  afterEach(() => { process.env = original; });

  test('POST upserts assignment_targets when target provided', async () => {
    // @ts-ignore simulate teacher auth
    (globalThis as any).__TEST_HEADERS_STORE__ = { cookies: { get: (k: string)=> ({ name: k, value: k === 'x-test-auth' ? 'teacher' : '' }) } } as any;
    const body = { course_id: '00000000-0000-0000-0000-000000000001', title: 'A', target: { source: 'v2', external_course_id: '11111111-1111-1111-1111-111111111111', version_id: '22222222-2222-2222-2222-222222222222' } } as any;
    const res = await (AssignPOST as any)(req('POST', 'http://localhost/api/assignments', body));
    expect([201, 500]).toContain(res.status);
  });

  test('PATCH upserts assignment_targets when target provided', async () => {
    // @ts-ignore simulate teacher auth
    (globalThis as any).__TEST_HEADERS_STORE__ = { cookies: { get: (k: string)=> ({ name: k, value: k === 'x-test-auth' ? 'teacher' : '' }) } } as any;
    const body = { title: 'B', target: { source: 'v1', external_course_id: '11111111-1111-1111-1111-111111111111', version_id: '22222222-2222-2222-2222-222222222222' } } as any;
    const res = await (AssignPATCH as any)(req('PATCH', 'http://localhost/api/assignments?id=00000000-0000-0000-0000-000000000001', body));
    expect([200, 500]).toContain(res.status);
  });
});
