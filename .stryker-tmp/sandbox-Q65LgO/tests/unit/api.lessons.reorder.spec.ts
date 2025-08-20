// @ts-nocheck
import { POST as ReorderPOST } from '../../apps/web/src/app/api/lessons/reorder/route';
import { addTestLesson } from '../../apps/web/src/lib/testStore';

function makePost(body: any, headers?: Record<string, string>) {
  const hdrs = { 'content-type': 'application/json', origin: 'http://localhost', referer: 'http://localhost/x', ...(headers || {}) };
  return new Request('http://localhost/api/lessons/reorder', { method: 'POST', headers: hdrs, body: JSON.stringify(body) });
}

describe('API /api/lessons/reorder (TEST_MODE)', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('unauth → 401; non-teacher → 403', async () => {
    const res1 = await (ReorderPOST as any)(makePost({ course_id: '00000000-0000-0000-0000-000000000001', items: [] }));
    expect(res1.status).toBe(401);
    // student forbidden
    // 
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'student');
    const res2 = await (ReorderPOST as any)(makePost({ course_id: '00000000-0000-0000-0000-000000000001', items: [] }));
    expect(res2.status).toBe(403);
  });

  test('invalid payload → 400; valid reorder → 200 { ok: true }', async () => {
    // teacher
    // 
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    let res = await (ReorderPOST as any)(makePost({}));
    expect(res.status).toBe(400);
    const courseId = '00000000-0000-0000-0000-000000000010';
    addTestLesson({ id: 'l1', course_id: courseId, title: 'A', content: '', order_index: 1, created_at: new Date().toISOString() });
    addTestLesson({ id: 'l2', course_id: courseId, title: 'B', content: '', order_index: 2, created_at: new Date().toISOString() });
    res = await (ReorderPOST as any)(makePost({ course_id: courseId, items: [ { id: 'l1', order_index: 2 }, { id: 'l2', order_index: 1 } ] }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
  });
});


