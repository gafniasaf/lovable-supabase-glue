// @ts-nocheck
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  let resp = await request.post('/api/__test__/reset');
  if (resp.status() === 404) resp = await request.post('/api/test/reset');
  expect(resp.ok()).toBeTruthy();
});

test('learning overview shows enrollments with lesson counts', async ({ page, context, request }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000');

  // Seed: teacher creates course and lessons
  await context.addCookies([{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  const createCourse = await request.post('/api/courses', { data: { title: `Course ${Date.now()}`, description: 'D' }, headers: { 'x-test-auth': 'teacher' } });
  expect(createCourse.status()).toBe(201);
  const course = await createCourse.json();
  for (let i = 1; i <= 3; i++) {
    const res = await request.post('/api/lessons', { data: { course_id: course.id, title: `L${i} title`, content: 'Body', order_index: i }, headers: { 'x-test-auth': 'teacher' } });
    expect(res.ok()).toBeTruthy();
  }

  // Student enrolls
  await context.addCookies([{ name: 'x-test-auth', value: 'student', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  const enroll = await request.post('/api/enrollments', { data: { course_id: course.id }, headers: { 'x-test-auth': 'student' } });
  expect(enroll.status()).toBe(201);

  // Visit overview
  await page.goto('/labs/student/learning-overview');
  const grid = page.getByTestId('learning-grid');
  await expect(grid).toBeVisible();
  await expect(page.getByTestId('learning-course-id').first()).toHaveText(course.id);
  await expect(page.getByTestId('learning-lesson-count').first()).toHaveText('3');
});


