// @ts-nocheck
import { createModuleApi, listModulesByCourse, deleteModuleApi } from '../../apps/web/src/server/services/modules';
import { resetTestStore } from '../../apps/web/src/lib/testStore';

describe('modules service (test-mode)', () => {
  beforeEach(() => {
    process.env.TEST_MODE = '1';
    resetTestStore();
  });

  test('create, list ordered by order_index, and delete', async () => {
    const courseId = 'aaaaaaaa-aaaa-aaaa-aaaa-000000000123';
    const m2 = await createModuleApi({ course_id: courseId, title: 'M2', order_index: 2 } as any);
    // Ensure unique ids across calls (id uses Date.now suffix)
    await new Promise(r => setTimeout(r, 5));
    const m1 = await createModuleApi({ course_id: courseId, title: 'M1', order_index: 1 } as any);
    const list = await listModulesByCourse(courseId);
    expect(list.map(m => m.id)).toEqual([m1.id, m2.id]);
    const res = await deleteModuleApi(m1.id);
    expect(res.ok).toBe(true);
    const after = await listModulesByCourse(courseId);
    expect(after.map(m => m.id)).toEqual([m2.id]);
  });
});


