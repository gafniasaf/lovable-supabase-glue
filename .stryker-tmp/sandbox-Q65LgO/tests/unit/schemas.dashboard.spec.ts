// @ts-nocheck
import { dashboardResponse, studentDashboard, teacherDashboard } from '@shared';

describe('dashboard schemas', () => {
  test('student continueLearning supports nextLessonId', () => {
    const v = studentDashboard.parse({
      kpis: { enrolledCourses: { label: 'x', value: 1 }, lessonsCompleted: { label: 'y', value: 0 } },
      continueLearning: {
        courseId: '00000000-0000-0000-0000-000000000001',
        courseTitle: 'C1',
        nextLessonTitle: 'Intro',
        nextLessonId: '00000000-0000-0000-0000-000000000002'
      },
      courses: []
    });
    expect(v.continueLearning?.nextLessonId).toBeDefined();
  });

  test('teacher/admin KPIs required shape', () => {
    const t = teacherDashboard.parse({
      kpis: { activeCourses: { label: 'a', value: 0 }, studentsEnrolled: { label: 'b', value: 0 }, needsGrading: { label: 'c', value: 0 } },
      recentCourses: []
    });
    expect(t.kpis.activeCourses.value).toBe(0);
  });

  test('dashboardResponse discriminated union guards by role', () => {
    const student = dashboardResponse.parse({ role: 'student', data: { kpis: { enrolledCourses: { label: 'x', value: 0 }, lessonsCompleted: { label: 'y', value: 0 } }, courses: [] } });
    expect(student.role).toBe('student');
    const teacher = dashboardResponse.parse({ role: 'teacher', data: { kpis: { activeCourses: { label: 'a', value: 0 }, studentsEnrolled: { label: 'b', value: 0 } }, recentCourses: [] } });
    expect(teacher.role).toBe('teacher');
  });
});


