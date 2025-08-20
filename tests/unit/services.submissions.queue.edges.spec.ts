import { listUngradedSubmissionsForTeacher } from '../../apps/web/src/server/services/submissions';
import { resetTestStore, addTestCourse, addTestAssignment, addTestSubmission } from '../../apps/web/src/lib/testStore';

describe('submissions queue edges', () => {
  beforeEach(() => { process.env.TEST_MODE = '1'; resetTestStore(); });

  test('page <= 0 clamps to first page; very large page returns empty', async () => {
    const teacherId = 't1';
    addTestCourse({ id: 'c1', title: 'C1', description: null, teacher_id: teacherId, created_at: new Date().toISOString() } as any);
    const a1 = { id: 'a1', course_id: 'c1', title: 'A1', description: null, due_at: null, points: 100, created_at: new Date().toISOString() } as any;
    addTestAssignment(a1);
    for (let i = 0; i < 2; i++) addTestSubmission({ id: `s${i}`, assignment_id: a1.id, student_id: 's', text: '', file_url: null, submitted_at: new Date().toISOString(), score: null, feedback: null } as any);
    const p0 = await listUngradedSubmissionsForTeacher(teacherId, { limit: 1, page: 0 });
    expect(p0.rows.length).toBe(1);
    const pBig = await listUngradedSubmissionsForTeacher(teacherId, { limit: 1, page: 999 });
    expect(pBig.rows.length).toBe(0);
  });
});


