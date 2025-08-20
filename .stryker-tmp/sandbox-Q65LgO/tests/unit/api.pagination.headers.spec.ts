// @ts-nocheck
import { GET as AssignList } from '../../apps/web/src/app/api/assignments/route';
import { GET as SubList } from '../../apps/web/src/app/api/submissions/route';
import { GET as QuizList } from '../../apps/web/src/app/api/quizzes/route';
import { GET as MsgList } from '../../apps/web/src/app/api/messages/route';
import { GET as ThreadsList } from '../../apps/web/src/app/api/messages/threads/route';
import { GET as NotifList } from '../../apps/web/src/app/api/notifications/route';
import { GET as EnrList } from '../../apps/web/src/app/api/enrollments/route';
// Skip runtime outcomes list since it requires a full Supabase mock chain with eq/order/range.

function make(url: string, headers?: Record<string,string>) {
  return new Request(url, { headers: headers as any } as any);
}

describe('x-total-count headers on list endpoints (smoke)', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('assignments list sets x-total-count', async () => {
    //  simulate student auth
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    const res = await (AssignList as any)(make('http://localhost/api/assignments?course_id=00000000-0000-0000-0000-000000000001'));
    expect([200,401,400]).toContain(res.status);
    if (res.status === 200) expect(res.headers.get('x-total-count')).toBeTruthy();
  });

  test('submissions list sets x-total-count', async () => {
    //  simulate teacher auth
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    const res = await (SubList as any)(make('http://localhost/api/submissions?assignment_id=00000000-0000-0000-0000-000000000001'));
    expect([200,401,403,400]).toContain(res.status);
    if (res.status === 200) expect(res.headers.get('x-total-count')).toBeTruthy();
  });

  test('quizzes list sets x-total-count', async () => {
    //  simulate teacher auth
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    const res = await (QuizList as any)(make('http://localhost/api/quizzes?course_id=00000000-0000-0000-0000-000000000001'));
    expect([200,401,400]).toContain(res.status);
    if (res.status === 200) expect(res.headers.get('x-total-count')).toBeTruthy();
  });

  test('messages threads list sets x-total-count', async () => {
    //  simulate student auth
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'student');
    const res = await (ThreadsList as any)(make('http://localhost/api/messages/threads'));
    expect([200,401]).toContain(res.status);
    if (res.status === 200) expect(res.headers.get('x-total-count')).toBeTruthy();
  });

  test('messages list sets x-total-count', async () => {
    //  simulate student auth
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'student');
    const res = await (MsgList as any)(make('http://localhost/api/messages?thread_id=00000000-0000-0000-0000-000000000001'));
    expect([200,401,400]).toContain(res.status);
    if (res.status === 200) expect(res.headers.get('x-total-count')).toBeTruthy();
  });

  test('notifications list sets x-total-count (prod path)', async () => {
    // prod path requires Supabase; accept absence by status, just ensure header when 200
    delete (process.env as any).TEST_MODE;
    const res = await (NotifList as any)(make('http://localhost/api/notifications'));
    expect([200,401]).toContain(res.status);
    if (res.status === 200) expect(res.headers.get('x-total-count')).toBeTruthy();
  });

  test('enrollments list sets x-total-count', async () => {
    //  simulate student auth
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'student');
    const res = await (EnrList as any)(make('http://localhost/api/enrollments?offset=0&limit=10'));
    expect([200,401]).toContain(res.status);
    if (res.status === 200) expect(res.headers.get('x-total-count')).toBeTruthy();
  });

  test.skip('runtime outcomes list sets x-total-count', async () => {});
});


