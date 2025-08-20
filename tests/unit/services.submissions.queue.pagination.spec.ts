import { listUngradedSubmissionsForTeacher } from '../../apps/web/src/server/services/submissions';
import { resetTestStore, addTestCourse, addTestAssignment, addTestSubmission } from '../../apps/web/src/lib/testStore';

describe('submissions queue pagination', () => {
  beforeEach(() => { process.env.TEST_MODE = '1'; resetTestStore(); });

  test('pages are consistent and ordered desc by submitted_at', async () => {
    const teacherId = 't1';
    addTestCourse({ id: 'c1', title: 'C1', description: null, teacher_id: teacherId, created_at: new Date().toISOString() } as any);
    const a1 = { id: 'a1', course_id: 'c1', title: 'A1', description: null, due_at: null, points: 100, created_at: new Date().toISOString() } as any;
    addTestAssignment(a1);
    const base = Date.now();
    for (let i = 0; i < 7; i++) {
      addTestSubmission({ id: `s${i}`, assignment_id: a1.id, student_id: 's', text: '', file_url: null, submitted_at: new Date(base - i * 1000).toISOString(), score: null, feedback: null } as any);
    }
    const p1 = await listUngradedSubmissionsForTeacher(teacherId, { limit: 3, page: 1 });
    const p2 = await listUngradedSubmissionsForTeacher(teacherId, { limit: 3, page: 2 });
    const p3 = await listUngradedSubmissionsForTeacher(teacherId, { limit: 3, page: 3 });
    expect(p1.rows.map((r: any) => r.id)).toEqual(['s0', 's1', 's2']);
    expect(p2.rows.map((r: any) => r.id)).toEqual(['s3', 's4', 's5']);
    expect(p3.rows.map((r: any) => r.id)).toEqual(['s6']);
    // Non-owned course filter returns empty
    const foreign = await listUngradedSubmissionsForTeacher('t2', { courseId: 'c1' });
    expect(foreign.rows).toEqual([]);
    expect(foreign.totalEstimated).toBe(0);
  });
});


