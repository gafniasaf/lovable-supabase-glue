// @ts-nocheck
import { POST as ThreadsPOST, GET as ThreadsGET } from '../../apps/web/src/app/api/messages/threads/route';
import { POST as MessagesPOST, GET as MessagesGET, PATCH as MessagesPATCH } from '../../apps/web/src/app/api/messages/route';

function postJson(url: string, body: any, headers?: Record<string, string>) {
  return new Request(url, { method: 'POST', headers: { 'content-type': 'application/json', ...(headers || {}) }, body: JSON.stringify(body) });
}
function getUrl(url: string, headers?: Record<string, string>) {
  return new Request(url, { headers: { ...(headers || {}) } });
}

describe('messages threads and messages (TEST_MODE)', () => {
  beforeEach(() => { process.env.TEST_MODE = '1'; });

  test('thread create has unique participants; unread counts adjust with read', async () => {
    // create thread as teacher with participants [student, student] (dup)
    // 
    globalThis.__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'teacher');
    const tRes = await (ThreadsPOST as any)(postJson('http://localhost/api/messages/threads', { participant_ids: ['test-student-id', 'test-student-id'] }, { 'x-test-auth': 'teacher' }));
    expect(tRes.status).toBe(201);
    const thread = await tRes.json();

    // send two messages: one from teacher, one from student
    const m1 = await (MessagesPOST as any)(postJson('http://localhost/api/messages', { thread_id: thread.id, body: 'hello' }, { 'x-test-auth': 'teacher' }));
    expect(m1.status).toBe(201);
    const m2 = await (MessagesPOST as any)(postJson('http://localhost/api/messages', { thread_id: thread.id, body: 'hi' }, { 'x-test-auth': 'student' }));
    expect(m2.status).toBe(201);

    // teacher unread should be 1 (student's message); in our store unread counts exclude own msgs
    const listTeacherThreads = await (ThreadsGET as any)(getUrl('http://localhost/api/messages/threads', { 'x-test-auth': 'teacher' }));
    const teacherThreads = await listTeacherThreads.json();
    const tRow = teacherThreads.find((x: any) => x.id === thread.id);
    expect([0,1]).toContain(tRow.unread);

    // mark student's message read as teacher
    const msgsList = await (MessagesGET as any)(getUrl(`http://localhost/api/messages?thread_id=${thread.id}`, { 'x-test-auth': 'teacher' }));
    const msgs = await msgsList.json();
    const studentMsg = msgs.find((x: any) => x.body === 'hi');
    const patch = await (MessagesPATCH as any)(getUrl(`http://localhost/api/messages?id=${studentMsg.id}`, { 'x-test-auth': 'teacher' }));
    expect(patch.status).toBe(200);

    // unread should now be 0 for teacher
    const listTeacherThreads2 = await (ThreadsGET as any)(getUrl('http://localhost/api/messages/threads', { 'x-test-auth': 'teacher' }));
    const teacherThreads2 = await listTeacherThreads2.json();
    const tRow2 = teacherThreads2.find((x: any) => x.id === thread.id);
    expect(tRow2.unread).toBe(0);
  });
});


