// @ts-nocheck
import { POST as AssignPOST, PATCH as AssignPATCH, DELETE as AssignDELETE } from '../../apps/web/src/app/api/assignments/route';

function makePost(body: any, headers?: Record<string, string>) {
  return new Request('http://localhost/api/assignments', { method: 'POST', headers: { 'content-type': 'application/json', ...(headers || {}) }, body: JSON.stringify(body) });
}
function makePatch(url: string, body: any, headers?: Record<string, string>) {
  return new Request(url, { method: 'PATCH', headers: { 'content-type': 'application/json', ...(headers || {}) }, body: JSON.stringify(body) });
}
function makeDelete(url: string, headers?: Record<string, string>) {
  return new Request(url, { method: 'DELETE', headers: { ...(headers || {}) } });
}

describe('Assignments CRUD API', () => {
  beforeEach(() => { process.env.TEST_MODE = '1'; });

  test('POST 201 for teacher; 403 student; 401 unauth', async () => {
    // title must be >= 3 chars; ensure valid. This route reads cookies() not req headers for POST.
    // 
    globalThis.__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'teacher');
    let res = await (AssignPOST as any)(makePost({ course_id: '00000000-0000-0000-0000-000000000001', title: 'Homework 1' }, { 'x-request-id': 'rq-a' }));
    expect(res.status).toBe(201);
    // Student should get 403
    // 
    globalThis.__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'student');
    res = await (AssignPOST as any)(makePost({ course_id: '00000000-0000-0000-0000-000000000001', title: 'Homework 1' }));
    expect(res.status).toBe(403);
    // Unauth (clear cookie)
    // 
    globalThis.__TEST_HEADERS_STORE__.cookies.delete('x-test-auth');
    res = await (AssignPOST as any)(makePost({ course_id: '00000000-0000-0000-0000-000000000001', title: 'Homework 1' }));
    expect(res.status).toBe(401);
  });

  test('PATCH validation and role', async () => {
    let res = await (AssignPATCH as any)(makePatch('http://localhost/api/assignments?id=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', { points: 'bad' }, { 'x-test-auth': 'teacher' }));
    expect(res.status).toBe(400);
    res = await (AssignPATCH as any)(makePatch('http://localhost/api/assignments?id=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', { points: 50 }, { 'x-test-auth': 'student' }));
    expect(res.status).toBe(403);
  });

  test('DELETE role checks', async () => {
    let res = await (AssignDELETE as any)(makeDelete('http://localhost/api/assignments?id=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', { 'x-test-auth': 'student' }));
    expect(res.status).toBe(403);
    res = await (AssignDELETE as any)(makeDelete('http://localhost/api/assignments?id=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', { 'x-test-auth': 'teacher' }));
    expect(res.status).toBe(200);
  });
});


