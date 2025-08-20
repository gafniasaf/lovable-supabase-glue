// @ts-nocheck
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  let resp = await request.post('/api/__test__/reset');
  if (resp.status() === 404) resp = await request.post('/api/test/reset');
  expect(resp.ok()).toBeTruthy();
});

test('learning overview advanced shows count and next lesson title', async ({ page, context, request }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000');

  // Teacher seeds course and three lessons (L01, L02, L03)
  await context.addCookies([{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  const courseRes = await request.post('/api/courses', { data: { title: `Course ${Date.now()}`, description: 'D' }, headers: { 'x-test-auth': 'teacher' } });
  expect(courseRes.status()).toBe(201);
  const course = await courseRes.json();
  const lessons = [
    { title: 'L01', content: 'Body', order_index: 1 },
    { title: 'L02', content: 'Body', order_index: 2 },
    { title: 'L03', content: 'Body', order_index: 3 },
  ];
  for (const l of lessons) {
    const r = await request.post('/api/lessons', { data: { course_id: course.id, ...l }, headers: { 'x-test-auth': 'teacher' } });
    expect(r.ok()).toBeTruthy();
  }

  // Student enrolls
  await context.addCookies([{ name: 'x-test-auth', value: 'student', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  const enroll = await request.post('/api/enrollments', { data: { course_id: course.id }, headers: { 'x-test-auth': 'student' } });
  expect(enroll.status()).toBe(201);

  // Visit page and assert
  await page.goto('/labs/student/learning-overview-advanced');
  const grid = page.getByTestId('learning-grid');
  await expect(grid).toBeVisible();
  await expect(page.getByTestId('learning-course-id').first()).toHaveText(course.id);
  await expect(page.getByTestId('learning-lesson-count').first()).toHaveText('3');
  await expect(page.getByTestId('learning-next-title').first()).toHaveText('L01');
});


