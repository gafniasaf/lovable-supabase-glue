// @ts-nocheck
import { createCourseApi, listCoursesForTeacherServer } from '../../apps/web/src/server/services/courses';
import { resetTestStore } from '../../apps/web/src/lib/testStore';

beforeEach(() => {
  process.env.TEST_MODE = '1';
  resetTestStore();
});

test('createCourseApi creates and lists for teacher in test-mode', async () => {
  const teacher = { id: 'u-teacher' };
  const created = await createCourseApi(teacher as any, { title: 'Algebra I', description: 'Intro' });
  expect(created.title).toBe('Algebra I');
  const list = await listCoursesForTeacherServer(teacher as any);
  expect(list.map((c: any) => c.id)).toContain(created.id);
});


