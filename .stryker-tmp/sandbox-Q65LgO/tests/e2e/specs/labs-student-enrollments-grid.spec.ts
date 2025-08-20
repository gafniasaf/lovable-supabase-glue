// @ts-nocheck
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  let resp = await request.post('/api/__test__/reset');
  if (resp.status() === 404) resp = await request.post('/api/test/reset');
  expect(resp.ok()).toBeTruthy();
});

test('student enrollments grid shows enrolled course id', async ({ page, context, request }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000');

  // Seed: teacher creates a course
  await context.addCookies([{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  const createCourse = await request.post('/api/courses', { data: { title: `Course ${Date.now()}`, description: 'D' }, headers: { 'x-test-auth': 'teacher' } });
  expect(createCourse.status()).toBe(201);
  const course = await createCourse.json();

  // Student enrolls
  await context.addCookies([{ name: 'x-test-auth', value: 'student', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  const enroll = await request.post('/api/enrollments', { data: { course_id: course.id }, headers: { 'x-test-auth': 'student' } });
  expect(enroll.status()).toBe(201);

  // Visit grid
  await page.goto('/labs/student/enrollments-grid');
  const grid = page.getByTestId('enrollments-grid');
  await expect(grid).toBeVisible();
  await expect(page.getByTestId('enrollment-course-id').first()).toHaveText(course.id);
});


