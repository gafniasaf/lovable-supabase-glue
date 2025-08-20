import { createParentLink, deleteParentLink, listChildrenForParent } from '../../apps/web/src/server/services/parentLinks';
import { resetTestStore } from '../../apps/web/src/lib/testStore';

describe('parentLinks service (test-mode)', () => {
  beforeEach(() => {
    process.env.TEST_MODE = '1';
    resetTestStore();
  });

  test('create, list and delete link', async () => {
    const parentId = 'p1';
    const studentId = 's1';
    const row = await createParentLink({ parentId, studentId });
    expect(row.parent_id).toBe(parentId);
    const list = await listChildrenForParent(parentId);
    expect(list.map(r => r.student_id)).toContain(studentId);
    const res = await deleteParentLink({ parentId, studentId });
    expect(res.ok).toBe(true);
  });
});


