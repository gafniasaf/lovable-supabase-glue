// @ts-nocheck
import { createAssignmentApi } from '../../apps/web/src/server/services/assignments';
import { resetTestStore, addTestEnrollment, listTestNotificationsByUser } from '../../apps/web/src/lib/testStore';

describe('services.assignments producer (test-mode)', () => {
  beforeEach(() => { process.env.TEST_MODE = '1'; resetTestStore(); });

  test('createAssignmentApi enqueues notification to enrolled students', async () => {
    const courseId = '00000000-0000-0000-0000-000000000777';
    addTestEnrollment({ id: 'e1', student_id: 's1', course_id: courseId, created_at: new Date().toISOString() } as any);
    const a = await createAssignmentApi({ course_id: courseId, title: 'HW 1' } as any);
    expect(a.course_id).toBe(courseId);
    const notifs = listTestNotificationsByUser('s1');
    expect(notifs.some((n: any) => n.type === 'assignment:new' && n.payload.assignment_id === a.id)).toBe(true);
  });
});


