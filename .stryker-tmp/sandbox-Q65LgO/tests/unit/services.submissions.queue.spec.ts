// @ts-nocheck
import { listUngradedSubmissionsForTeacher } from '../../apps/web/src/server/services/submissions';
import { resetTestStore, addTestCourse, addTestAssignment, addTestSubmission } from '../../apps/web/src/lib/testStore';

describe('services.submissions queue (test-mode)', () => {
  beforeEach(() => {
    process.env.TEST_MODE = '1';
    resetTestStore();
  });

  test('filters by course/assignment, paginates, sorts by submitted_at desc', async () => {
    const teacherId = 't1';
    const courseA = { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', title: 'A', description: null, teacher_id: teacherId, created_at: new Date().toISOString() } as any;
    const courseB = { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', title: 'B', description: null, teacher_id: teacherId, created_at: new Date().toISOString() } as any;
    addTestCourse(courseA); addTestCourse(courseB);
    const a1 = { id: 'a1', course_id: courseA.id, title: 'A1', description: null, due_at: null, points: 100, created_at: new Date().toISOString() } as any;
    const b1 = { id: 'b1', course_id: courseB.id, title: 'B1', description: null, due_at: null, points: 100, created_at: new Date().toISOString() } as any;
    addTestAssignment(a1); addTestAssignment(b1);
    const now = Date.now();
    addTestSubmission({ id: 's1', assignment_id: a1.id, student_id: 's', text: '', file_url: null, submitted_at: new Date(now - 1000).toISOString(), score: null, feedback: null } as any);
    addTestSubmission({ id: 's2', assignment_id: a1.id, student_id: 's', text: '', file_url: null, submitted_at: new Date(now - 500).toISOString(), score: null, feedback: null } as any);
    addTestSubmission({ id: 's3', assignment_id: b1.id, student_id: 's', text: '', file_url: null, submitted_at: new Date(now - 100).toISOString(), score: 80, feedback: null } as any);
    const { rows, totalEstimated } = await listUngradedSubmissionsForTeacher(teacherId, { courseId: courseA.id, limit: 10, page: 1 });
    expect(totalEstimated).toBe(2);
    expect(rows.map(r => r.id)).toEqual(['s2', 's1']);
    // Assignment filter
    const onlyA1 = await listUngradedSubmissionsForTeacher(teacherId, { assignmentId: a1.id });
    expect(onlyA1.rows.length).toBe(2);
  });

  test('empty-state when no courses', async () => {
    const out = await listUngradedSubmissionsForTeacher('t9');
    expect(out.rows.length).toBe(0);
    expect(out.totalEstimated).toBe(0);
  });
});


