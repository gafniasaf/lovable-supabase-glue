// @ts-nocheck
import { createAssignmentApi, listAssignmentsByCourse, updateAssignmentApi, deleteAssignmentApi } from '../../apps/web/src/server/services/assignments';
import { resetTestStore } from '../../apps/web/src/lib/testStore';

describe('assignments service (test-mode)', () => {
  beforeEach(() => {
    process.env.TEST_MODE = '1';
    resetTestStore();
  });

  test('create, list order by created_at desc', async () => {
    const courseId = 'aaaaaaaa-aaaa-aaaa-aaaa-000000000123';
    const a1 = await createAssignmentApi({ course_id: courseId, title: 'A1' } as any);
    await new Promise(r => setTimeout(r, 5));
    const a2 = await createAssignmentApi({ course_id: courseId, title: 'A2' } as any);
    const rows = await listAssignmentsByCourse(courseId);
    expect(rows.map(r => r.id)[0]).toBe(a2.id);
    expect(rows.map(r => r.id)[1]).toBe(a1.id);
  });

  test('update and delete assignment', async () => {
    const courseId = 'aaaaaaaa-aaaa-aaaa-aaaa-000000000123';
    const a = await createAssignmentApi({ course_id: courseId, title: 'HW' } as any);
    const updated = await updateAssignmentApi(a.id, { title: 'HW2' } as any);
    expect(updated?.title).toBe('HW2');
    const res = await deleteAssignmentApi(a.id);
    expect(res.ok).toBe(true);
  });
});


