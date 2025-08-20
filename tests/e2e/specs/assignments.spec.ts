import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  let resp = await request.post('/api/__test__/reset');
  if (resp.status() === 404) resp = await request.post('/api/test/reset');
  expect(resp.ok()).toBeTruthy();
});

test('Assignments CRUD flow MVP', async ({ page, context, request }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000');

  // Teacher creates a course
  await context.addCookies([{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  const courseTitle = `Course ${Date.now()}`;
  const createCourse = await request.post('/api/courses', { data: { title: courseTitle, description: 'D' }, headers: { 'x-test-auth': 'teacher' } });
  expect(createCourse.status()).toBe(201);
  const course = await createCourse.json();

  // Seed assignments: second is newer and should appear first
  const a1 = await request.post('/api/assignments', { data: { course_id: course.id, title: 'Assn 1', description: 'Desc1' }, headers: { 'x-test-auth': 'teacher' } });
  expect(a1.status()).toBe(201);
  const a2 = await request.post('/api/assignments', { data: { course_id: course.id, title: 'Assn 2', description: 'Desc2' }, headers: { 'x-test-auth': 'teacher' } });
  expect(a2.status()).toBe(201);

  // Teacher view: newest first
  await page.goto(`/dashboard/teacher/${course.id}/assignments`);
  const list = page.getByTestId('assignments-list');
  await expect(list).toBeVisible();
  const rows = list.getByTestId('assignment-row');
  await expect(rows).toHaveCount(2);
  await expect(rows.nth(0).getByTestId('assignment-title')).toHaveText('Assn 2');
  await expect(rows.nth(1).getByTestId('assignment-title')).toHaveText('Assn 1');

  // Student submits to first (newest) assignment
  await context.addCookies([{ name: 'x-test-auth', value: 'student', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  const listResp = await request.get(`/api/assignments?course_id=${course.id}`, { headers: { 'x-test-auth': 'student' } });
  expect(listResp.ok()).toBeTruthy();
  const items = await listResp.json();
  const firstAssignmentId = items[0].id;
  const submit = await request.post('/api/submissions', { data: { assignment_id: firstAssignmentId, text: 'My answer' }, headers: { 'x-test-auth': 'student' } });
  expect(submit.status()).toBe(201);

  // Optional: teacher grades the submission
  const subsList = await request.get(`/api/submissions?assignment_id=${firstAssignmentId}`, { headers: { 'x-test-auth': 'teacher' } });
  expect(subsList.ok()).toBeTruthy();
  const subs = await subsList.json();
  const subId = subs[0].id;
  const grade = await request.patch(`/api/submissions?id=${subId}`, { data: { score: 95, feedback: 'Great job' }, headers: { 'x-test-auth': 'teacher' } });
  expect(grade.ok()).toBeTruthy();

  // Student list page renders
  await page.goto(`/dashboard/student/${course.id}/assignments`);
  await expect(page.getByTestId('student-assignments-list')).toBeVisible();
});


