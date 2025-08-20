// @ts-nocheck
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  let resp = await request.post('/api/__test__/reset');
  if (resp.status() === 404) resp = await request.post('/api/test/reset');
  expect(resp.ok()).toBeTruthy();
});

test('student dashboard shows enrolled course', async ({ page, context, request }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3020');
  // Seed: teacher creates course
  await context.addCookies([{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  const created = await request.post('/api/courses', { data: { title: 'T1', description: '' }, headers: { 'x-test-auth': 'teacher' } });
  expect(created.ok()).toBeTruthy();
  const course = await created.json();
  // Enroll as student
  await context.clearCookies();
  await context.addCookies([{ name: 'x-test-auth', value: 'student', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  const enrolled = await request.post('/api/enrollments', { data: { course_id: course.id }, headers: { 'x-test-auth': 'student' } });
  expect(enrolled.ok()).toBeTruthy();

  // View dashboard
  await page.goto('/dashboard/student');
  await expect(page.getByTestId('student-courses-grid')).toBeVisible();
  await expect(page.getByTestId('student-course-card')).toBeVisible();
});


