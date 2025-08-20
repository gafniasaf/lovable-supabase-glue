// @ts-nocheck
import { getDashboardForUser } from '../../apps/web/src/server/services/dashboard';
import { addTestCourse, addTestEnrollment, resetTestStore, addTestLesson } from '../../apps/web/src/lib/testStore';

describe('dashboard service (test-mode)', () => {
  beforeEach(() => {
    process.env.TEST_MODE = '1';
    resetTestStore();
  });

  test('teacher dashboard lists recent courses and KPIs', async () => {
    const teacherId = 't1';
    addTestCourse({ id: 'c1', title: 'C1', description: null, teacher_id: teacherId, created_at: new Date().toISOString() } as any);
    const res: any = await getDashboardForUser(teacherId, 'teacher');
    expect(res.role).toBe('teacher');
    expect(res.data.kpis.activeCourses.value).toBe(1);
    expect(res.data.recentCourses[0].title).toBe('C1');
  });

  test('student dashboard computes continueLearning and progress', async () => {
    const studentId = 's1';
    const courseId = 'cccccccc-cccc-cccc-cccc-000000000123';
    addTestEnrollment({ id: 'e1', student_id: studentId, course_id: courseId, created_at: new Date().toISOString() } as any);
    addTestLesson({ id: 'l1', course_id: courseId, title: 'Intro', content: '', order_index: 1, created_at: new Date().toISOString() } as any);
    const res: any = await getDashboardForUser(studentId, 'student');
    expect(res.role).toBe('student');
    expect(res.data.kpis.enrolledCourses.value).toBe(1);
    expect(res.data.continueLearning?.courseId).toBe(courseId);
    expect(res.data.courses[0].progress.totalLessons).toBe(1);
  });

  test('admin dashboard returns KPI placeholders', async () => {
    const res: any = await getDashboardForUser('admin', 'admin');
    expect(res.role).toBe('admin');
    expect(res.data.kpis.totalUsers.value).toBeDefined();
  });
});


