import { POST as QuizzesPOST } from '../../apps/web/src/app/api/quizzes/route';

function post(body: any, headers?: Record<string,string>) {
  return new Request('http://localhost/api/quizzes', { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);
}

describe('quizzes POST CSRF double-submit enforcement', () => {
  const original = { ...process.env } as any;
  beforeEach(() => { process.env = { ...original, TEST_MODE: '1', CSRF_DOUBLE_SUBMIT: '1', NEXT_PUBLIC_BASE_URL: 'http://localhost' } as any; });
  afterEach(() => { process.env = original; });

  test('missing or mismatched tokens -> 403; matching -> 201/500', async () => {
    // missing
    let res = await (QuizzesPOST as any)(post({ course_id: '00000000-0000-0000-0000-000000000001', title: 'Q' }, { 'x-test-auth': 'teacher', cookie: 'csrf_token=x' }));
    expect(res.status).toBe(403);
    // mismatched
    res = await (QuizzesPOST as any)(post({ course_id: '00000000-0000-0000-0000-000000000001', title: 'Q' }, { 'x-test-auth': 'teacher', 'x-csrf-token': 'a', cookie: 'csrf_token=b' }));
    expect(res.status).toBe(403);
    // matching
    res = await (QuizzesPOST as any)(post({ course_id: '00000000-0000-0000-0000-000000000001', title: 'Q' }, { 'x-test-auth': 'teacher', 'x-csrf-token': 't', cookie: 'csrf_token=t' }));
    expect([201,500]).toContain(res.status);
  });
});


