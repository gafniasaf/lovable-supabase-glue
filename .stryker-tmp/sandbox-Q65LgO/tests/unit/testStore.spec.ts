// @ts-nocheck
import { addTestCourse, listTestCoursesByTeacher, resetTestStore, addTestLesson, listTestLessonsByCourse, addTestEnrollment, listTestEnrollmentsByStudent } from '../../apps/web/src/lib/testStore';

beforeEach(() => {
  resetTestStore();
});

test('testStore courses add/list/reset', () => {
  const teacherId = 't1';
  const course = { id: 'c1', title: 'T', description: null, teacher_id: teacherId, created_at: new Date().toISOString() } as any;
  expect(listTestCoursesByTeacher(teacherId)).toHaveLength(0);
  addTestCourse(course);
  expect(listTestCoursesByTeacher(teacherId)).toHaveLength(1);
  resetTestStore();
  expect(listTestCoursesByTeacher(teacherId)).toHaveLength(0);
});

test('testStore lessons add/list/reset', () => {
  const courseId = 'c1';
  const l1 = { id: 'l1', course_id: courseId, title: 'A', content: '', order_index: 2, created_at: new Date().toISOString() } as any;
  const l2 = { id: 'l2', course_id: courseId, title: 'B', content: '', order_index: 1, created_at: new Date().toISOString() } as any;
  expect(listTestLessonsByCourse(courseId)).toHaveLength(0);
  addTestLesson(l1);
  addTestLesson(l2);
  const result = listTestLessonsByCourse(courseId);
  expect(result).toHaveLength(2);
  expect(result[0].id).toBe('l2'); // sorted by order_index
  resetTestStore();
  expect(listTestLessonsByCourse(courseId)).toHaveLength(0);
});

test('testStore enrollments add/list/reset', () => {
  const studentId = 's1';
  const courseId = 'c1';
  expect(listTestEnrollmentsByStudent(studentId)).toHaveLength(0);
  addTestEnrollment({ id: 'e1', student_id: studentId, course_id: courseId, created_at: new Date().toISOString() } as any);
  const rows = listTestEnrollmentsByStudent(studentId);
  expect(rows.map(r => r.id)).toEqual(['e1']);
  resetTestStore();
  expect(listTestEnrollmentsByStudent(studentId)).toHaveLength(0);
});


