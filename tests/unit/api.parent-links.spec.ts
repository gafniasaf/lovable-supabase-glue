import { POST as PLPost, DELETE as PLDelete, GET as PLGet } from '../../apps/web/src/app/api/parent-links/route';

function makePost(body: any, headers?: Record<string, string>) {
  const hdrs = { 'content-type': 'application/json', origin: 'http://localhost', referer: 'http://localhost/x', ...(headers || {}) };
  return new Request('http://localhost/api/parent-links', { method: 'POST', headers: hdrs, body: JSON.stringify(body) });
}
function makeDelete(body: any, headers?: Record<string, string>) {
  const hdrs = { 'content-type': 'application/json', origin: 'http://localhost', referer: 'http://localhost/x', ...(headers || {}) };
  return new Request('http://localhost/api/parent-links', { method: 'DELETE', headers: hdrs, body: JSON.stringify(body) });
}
function makeGet(url: string, headers?: Record<string, string>) {
  return new Request(url, { method: 'GET', headers });
}

describe('API /api/parent-links', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('POST unauth → 401; non-admin → 403; admin 201', async () => {
    let res = await (PLPost as any)(makePost({ parent_id: 'p1', student_id: 's1' }));
    expect(res.status).toBe(401);
    // simulate teacher
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    res = await (PLPost as any)(makePost({ parent_id: 'p1', student_id: 's1' }));
    expect(res.status).toBe(403);
    // simulate admin
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'admin');
    res = await (PLPost as any)(makePost({ parent_id: 'test-parent-id', student_id: 'test-student-id' }));
    expect(res.status).toBe(201);
  });

  test('DELETE unauth → 401; non-admin → 403; admin 200', async () => {
    let res = await (PLDelete as any)(makeDelete({ parent_id: 'p1', student_id: 's1' }));
    expect(res.status).toBe(401);
    // teacher forbidden
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    res = await (PLDelete as any)(makeDelete({ parent_id: 'p1', student_id: 's1' }));
    expect(res.status).toBe(403);
    // admin ok
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'admin');
    res = await (PLDelete as any)(makeDelete({ parent_id: 'test-parent-id', student_id: 'test-student-id' }));
    expect(res.status).toBe(200);
  });

  test('GET unauth → 401; missing parent_id → 400; non-admin self allowed; non-self forbidden', async () => {
    let res = await (PLGet as any)(makeGet('http://localhost/api/parent-links'));
    expect(res.status).toBe(401);
    // admin missing param -> 400
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'admin');
    res = await (PLGet as any)(makeGet('http://localhost/api/parent-links'));
    expect(res.status).toBe(400);
    // parent self allowed
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'parent');
    res = await (PLGet as any)(makeGet('http://localhost/api/parent-links?parent_id=test-parent-id'));
    expect([200, 204]).toContain(res.status);
    // parent non-self forbidden
    res = await (PLGet as any)(makeGet('http://localhost/api/parent-links?parent_id=other-parent-id'));
    expect(res.status).toBe(403);
  });
});


