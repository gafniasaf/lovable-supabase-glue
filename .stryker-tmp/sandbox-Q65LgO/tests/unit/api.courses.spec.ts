// @ts-nocheck
import * as supabaseServer from '../../apps/web/src/lib/supabaseServer';
import { POST as CoursesPOST, GET as CoursesGET } from '../../apps/web/src/app/api/courses/route';

function makePost(body: any, headers?: Record<string, string>) {
  return new Request('http://localhost/api/courses', { method: 'POST', headers: { 'content-type': 'application/json', ...(headers || {}) }, body: JSON.stringify(body) });
}
function makeGet(headers?: Record<string, string>) {
  return new Request('http://localhost/api/courses', { method: 'GET', headers });
}

describe('API /api/courses', () => {
  beforeEach(() => { jest.restoreAllMocks(); });

  test('GET unauthorized returns 401 Problem with x-request-id', async () => {
    const res = await (CoursesGET as any)(makeGet());
    expect(res.status).toBe(401);
    expect(res.headers.get('x-request-id')).toBeTruthy();
    const json = await res.json();
    expect(json?.error?.code).toBe('UNAUTHENTICATED');
  });

  test('POST requires teacher role: non-teacher gets 403', async () => {
    (process.env as any).TEST_MODE = '1';
    const res = await (CoursesPOST as any)(makePost({ title: 'Course A' }, { 'x-test-auth': 'student' }));
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json?.error?.code).toBe('FORBIDDEN');
  });

  test('GET echoes upstream x-request-id', async () => {
    (process.env as any).TEST_MODE = '1';
    // Simulate auth
    // 
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    const res = await (CoursesGET as any)(makeGet({ 'x-request-id': 'rq-test' }));
    expect(res.headers.get('x-request-id')).toBe('rq-test');
  });
});


