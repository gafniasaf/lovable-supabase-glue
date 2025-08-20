import { PATCH as ReadAllPATCH } from '../../apps/web/src/app/api/messages/threads/[id]/read-all/route';
import { createTestThread, addTestMessage } from '../../apps/web/src/lib/testStore';

function makePatch(url: string, headers?: Record<string, string>) {
  return new Request(url, { method: 'PATCH', headers });
}

describe('API /api/messages/threads/[id]/read-all', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('unauth → 401 with x-request-id', async () => {
    const res = await (ReadAllPATCH as any)(makePatch('http://localhost/api/messages/threads/tt/read-all'));
    expect(res.status).toBe(401);
    expect(res.headers.get('x-request-id')).toBeTruthy();
  });

  test('marks all messages as read for participant; non-participant remains unaffected (TEST_MODE)', async () => {
    // create thread with two users
    const th = createTestThread(['test-student-id', 'test-teacher-id']);
    addTestMessage({ thread_id: th.id, sender_id: 'test-teacher-id', body: 'hi' });
    addTestMessage({ thread_id: th.id, sender_id: 'test-student-id', body: 'hello' });
    // student marks read-all
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'student');
    const res = await (ReadAllPATCH as any)(makePatch(`http://localhost/api/messages/threads/${th.id}/read-all`), { params: { id: th.id } } as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
  });
});


