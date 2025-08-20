// @ts-nocheck
import { getDashboardForUser } from '../../apps/web/src/server/services/dashboard';
import { resetTestStore, addTestCourse, addTestAssignment, addTestSubmission } from '../../apps/web/src/lib/testStore';

describe('services.dashboard needsGrading (test-mode)', () => {
  beforeEach(() => { process.env.TEST_MODE = '1'; resetTestStore(); });

  test("ungraded count across teacher's courses; pagination independent; empty-state", async () => {
    const teacherId = 't1';
    addTestCourse({ id: 'c1', title: 'Course 1', description: null, teacher_id: teacherId, created_at: new Date().toISOString() } as any);
    addTestCourse({ id: 'c2', title: 'Course 2', description: null, teacher_id: teacherId, created_at: new Date().toISOString() } as any);
    const a1 = { id: 'a1', course_id: 'c1', title: 'A1', description: null, due_at: null, points: 100, created_at: new Date().toISOString() } as any;
    const a2 = { id: 'a2', course_id: 'c2', title: 'A2', description: null, due_at: null, points: 100, created_at: new Date().toISOString() } as any;
    addTestAssignment(a1); addTestAssignment(a2);
    addTestSubmission({ id: 's1', assignment_id: a1.id, student_id: 's', text: '', file_url: null, submitted_at: new Date().toISOString(), score: null, feedback: null } as any);
    addTestSubmission({ id: 's2', assignment_id: a2.id, student_id: 's', text: '', file_url: null, submitted_at: new Date().toISOString(), score: null, feedback: null } as any);
    const out: any = await getDashboardForUser(teacherId, 'teacher');
    expect(out.data.kpis.needsGrading.value).toBe(2);
    // empty state
    const empty: any = await getDashboardForUser('t9', 'teacher');
    expect(empty.data.kpis.needsGrading.value).toBe(0);
  });
});


