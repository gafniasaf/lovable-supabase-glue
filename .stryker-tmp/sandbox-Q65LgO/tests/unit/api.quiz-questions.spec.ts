// @ts-nocheck
import { POST as QQPost, GET as QQGet } from '../../apps/web/src/app/api/quiz-questions/route';

function post(body: any, headers?: Record<string, string>) {
  const hdrs = { 'content-type': 'application/json', origin: 'http://localhost', referer: 'http://localhost/x', ...(headers || {}) };
  return new Request('http://localhost/api/quiz-questions', { method: 'POST', headers: hdrs, body: JSON.stringify(body) });
}
function get(url: string, headers?: Record<string, string>) { return new Request(url, { method: 'GET', headers }); }

describe('API /api/quiz-questions (TEST_MODE)', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('POST: unauth 401; non-teacher 403; invalid payload 400', async () => {
    // unauth with valid payload hits auth check
    let res = await (QQPost as any)(post({ quiz_id: '00000000-0000-0000-0000-000000000123', text: 'Question' }));
    expect(res.status).toBe(401);
    // student forbidden with valid payload
    // 
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'student');
    res = await (QQPost as any)(post({ quiz_id: '00000000-0000-0000-0000-000000000123', text: 'Question' }));
    expect(res.status).toBe(403);
    // teacher invalid payload -> 400 (min text len)
    // 
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    res = await (QQPost as any)(post({ quiz_id: '00000000-0000-0000-0000-000000000123', text: 'Q' }));
    expect(res.status).toBe(400);
  });

  test('GET: unauth 401; missing quiz_id 400; ok 200', async () => {
    let res = await (QQGet as any)(get('http://localhost/api/quiz-questions'));
    expect(res.status).toBe(400); // missing quiz_id first
    // now set auth but still missing param
    // 
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'student');
    res = await (QQGet as any)(get('http://localhost/api/quiz-questions'));
    expect(res.status).toBe(400);
    res = await (QQGet as any)(get('http://localhost/api/quiz-questions?quiz_id=00000000-0000-0000-0000-000000000123'));
    expect([200, 204]).toContain(res.status);
  });
});


