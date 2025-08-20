// @ts-nocheck
import { GET as AssignmentsGET } from '../../apps/web/src/app/api/assignments/route';
import { GET as SubmissionsGET } from '../../apps/web/src/app/api/submissions/route';
import { GET as MessagesGET } from '../../apps/web/src/app/api/messages/route';
import { GET as ThreadsGET } from '../../apps/web/src/app/api/messages/threads/route';
import { GET as QuizzesGET } from '../../apps/web/src/app/api/quizzes/route';

const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);

describe('listing endpoints include x-total-count when 200', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('assignments', async () => {
    // 
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    const res = await (AssignmentsGET as any)(get('http://localhost/api/assignments?course_id=00000000-0000-0000-0000-000000000001'));
    expect([200,401,400]).toContain(res.status);
    if (res.status === 200) expect(res.headers.get('x-total-count')).toBeTruthy();
  });

  test('submissions', async () => {
    // 
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    const res = await (SubmissionsGET as any)(get('http://localhost/api/submissions?course_id=00000000-0000-0000-0000-000000000001'));
    expect([200,401,400]).toContain(res.status);
    if (res.status === 200) expect(res.headers.get('x-total-count')).toBeTruthy();
  });

  test('messages', async () => {
    // 
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    const res = await (MessagesGET as any)(get('http://localhost/api/messages?thread_id=00000000-0000-0000-0000-000000000001'));
    expect([200,401,400]).toContain(res.status);
    if (res.status === 200) expect(res.headers.get('x-total-count')).toBeTruthy();
  });

  test('threads', async () => {
    // 
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    const res = await (ThreadsGET as any)(get('http://localhost/api/messages/threads'));
    expect([200,401,400]).toContain(res.status);
    if (res.status === 200) expect(res.headers.get('x-total-count')).toBeTruthy();
  });

  test('quizzes', async () => {
    // 
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    const res = await (QuizzesGET as any)(get('http://localhost/api/quizzes?course_id=00000000-0000-0000-0000-000000000001'));
    expect([200,401,400]).toContain(res.status);
    if (res.status === 200) expect(res.headers.get('x-total-count')).toBeTruthy();
  });
});


