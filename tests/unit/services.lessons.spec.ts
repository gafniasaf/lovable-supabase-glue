import { createLessonApi, listLessonsForCourseServer } from '../../apps/web/src/server/services/lessons';
import { resetTestStore } from '../../apps/web/src/lib/testStore';

beforeEach(() => {
  process.env.TEST_MODE = '1';
  resetTestStore();
});

test('createLessonApi creates and lists for course in test-mode', async () => {
  const courseId = 'aaaaaaaa-aaaa-aaaa-aaaa-000000000123';
  await createLessonApi({ course_id: courseId, title: 'L1', content: '', order_index: 2 } as any);
  await createLessonApi({ course_id: courseId, title: 'L2', content: '', order_index: 1 } as any);
  const lessons = await listLessonsForCourseServer(courseId);
  expect(lessons).toHaveLength(2);
  expect(lessons[0].title).toBe('L2');
});

test('reorder lessons route applies new order', async () => {
  const courseId = 'aaaaaaaa-aaaa-aaaa-aaaa-000000000124';
  const a = await createLessonApi({ course_id: courseId, title: 'A', content: '', order_index: 1 } as any);
  const b = await createLessonApi({ course_id: courseId, title: 'B', content: '', order_index: 2 } as any);
  const reorder = await import('../../apps/web/src/app/api/lessons/reorder/route');
  // @ts-ignore
  globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
  const res = await reorder.POST(new Request('http://localhost/api/lessons/reorder', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-test-auth': 'teacher' },
    body: JSON.stringify({ course_id: courseId, items: [ { id: b.id, order_index: 1 }, { id: a.id, order_index: 2 } ] })
  }) as any);
  expect(res.status).toBe(200);
  const rows = await listLessonsForCourseServer(courseId);
  expect(rows.map((x: any) => x.id)).toEqual([b.id, a.id]);
});


