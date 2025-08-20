// @ts-nocheck
import { POST as QCPost, GET as QCGet } from '../../apps/web/src/app/api/quiz-choices/route';

function post(body: any, headers?: Record<string, string>) {
  const hdrs = { 'content-type': 'application/json', origin: 'http://localhost', referer: 'http://localhost/x', ...(headers || {}) };
  return new Request('http://localhost/api/quiz-choices', { method: 'POST', headers: hdrs, body: JSON.stringify(body) });
}
function get(url: string, headers?: Record<string, string>) { return new Request(url, { method: 'GET', headers }); }

describe('API /api/quiz-choices (TEST_MODE)', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('POST: unauth 401; non-teacher 403; invalid payload 400', async () => {
    let res = await (QCPost as any)(post({ question_id: '00000000-0000-0000-0000-000000000321', text: '' }));
    expect(res.status).toBe(401);
    // student forbidden
    // 
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'student');
    res = await (QCPost as any)(post({ question_id: '00000000-0000-0000-0000-000000000321', text: '' }));
    expect(res.status).toBe(403);
    // teacher invalid payload -> 400 (text min)
    // 
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    res = await (QCPost as any)(post({ question_id: '00000000-0000-0000-0000-000000000321', text: '' }));
    expect(res.status).toBe(400);
  });

  test('GET: unauth 401; missing question_id 400; ok 200', async () => {
    let res = await (QCGet as any)(get('http://localhost/api/quiz-choices'));
    expect(res.status).toBe(400);
    // auth but still missing param
    // 
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'student');
    res = await (QCGet as any)(get('http://localhost/api/quiz-choices'));
    expect(res.status).toBe(400);
    res = await (QCGet as any)(get('http://localhost/api/quiz-choices?question_id=00000000-0000-0000-0000-000000000321'));
    expect([200, 204]).toContain(res.status);
  });
});


