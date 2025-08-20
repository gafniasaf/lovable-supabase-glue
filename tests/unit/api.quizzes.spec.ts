import { GET as QuizzesGET, POST as QuizzesPOST, PATCH as QuizzesPATCH, DELETE as QuizzesDELETE } from '../../apps/web/src/app/api/quizzes/route';

function makeGet(url: string, headers?: Record<string, string>) { return new Request(url, { method: 'GET', headers }); }
function makePost(body: any, headers?: Record<string, string>) { return new Request('http://localhost/api/quizzes', { method: 'POST', headers: { 'content-type': 'application/json', ...(headers || {}) }, body: JSON.stringify(body) }); }
function makePatch(url: string, body: any, headers?: Record<string, string>) { return new Request(url, { method: 'PATCH', headers: { 'content-type': 'application/json', ...(headers || {}) }, body: JSON.stringify(body) }); }
function makeDelete(url: string, headers?: Record<string, string>) { return new Request(url, { method: 'DELETE', headers }); }

describe('API /api/quizzes', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  function clearAuth() {
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.clear?.();
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.headers?.clear?.();
  }

  test('GET requires course_id → 400', async () => {
    const res = await (QuizzesGET as any)(makeGet('http://localhost/api/quizzes', { 'x-test-auth': 'teacher' }));
    expect(res.status).toBe(400);
  });

  test('POST requires teacher: non-teacher → 403; unauth → 401', async () => {
    // Ensure CSRF origin matches since createApiHandler enforces it when schema is present
    const headers = { 'content-type': 'application/json', origin: 'http://localhost', referer: 'http://localhost/page' } as any;
    let res = await (QuizzesPOST as any)(new Request('http://localhost/api/quizzes', { method: 'POST', headers, body: JSON.stringify({ title: 'Quiz 1', course_id: '00000000-0000-0000-0000-000000000001' }) }));
    expect(res.status).toBe(401);
    // Simulate student auth via test cookie store used by next/headers mock
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'student');
    res = await (QuizzesPOST as any)(new Request('http://localhost/api/quizzes', { method: 'POST', headers, body: JSON.stringify({ title: 'Quiz 1', course_id: '00000000-0000-0000-0000-000000000001' }) }));
    expect(res.status).toBe(403);
  });

  test('PATCH requires id and teacher', async () => {
    clearAuth();
    const hdrs = { origin: 'http://localhost', referer: 'http://localhost/page' } as any;
    let res = await (QuizzesPATCH as any)(makePatch('http://localhost/api/quizzes', { title: 'New' }, { ...hdrs, 'x-test-auth': 'teacher' }));
    expect(res.status).toBe(400);
    res = await (QuizzesPATCH as any)(makePatch('http://localhost/api/quizzes?id=00000000-0000-0000-0000-000000000001', { title: 'New' }, hdrs));
    expect([400,401]).toContain(res.status);
  });

  test('DELETE requires id and teacher', async () => {
    const hdrs = { origin: 'http://localhost', referer: 'http://localhost/page' } as any;
    // ensure auth cookie is set for first request
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    let res = await (QuizzesDELETE as any)(makeDelete('http://localhost/api/quizzes', hdrs));
    expect(res.status).toBe(400);
    // switch to student for forbidden check
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'student');
    res = await (QuizzesDELETE as any)(makeDelete('http://localhost/api/quizzes?id=00000000-0000-0000-0000-000000000001', hdrs));
    expect([400,403]).toContain(res.status);
  });
});


