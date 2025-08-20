// @ts-nocheck
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  let resp = await request.post('/api/__test__/reset');
  if (resp.status() === 404) resp = await request.post('/api/test/reset');
  expect(resp.ok()).toBeTruthy();
});

test('study planner shows counts, next title, and reading time', async ({ page, context, request }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000');

  // Teacher seeds: course + lessons (L01 ~1500 chars content, L02)
  await context.addCookies([{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  const courseRes = await request.post('/api/courses', { data: { title: `Course ${Date.now()}`, description: 'D' }, headers: { 'x-test-auth': 'teacher' } });
  expect(courseRes.status()).toBe(201);
  const course = await courseRes.json();

  const longContent = 'a'.repeat(1500);
  const r1 = await request.post('/api/lessons', { data: { course_id: course.id, title: 'L01', content: longContent, order_index: 1 }, headers: { 'x-test-auth': 'teacher' } });
  expect(r1.ok()).toBeTruthy();
  const r2 = await request.post('/api/lessons', { data: { course_id: course.id, title: 'L02', content: 'Short', order_index: 2 }, headers: { 'x-test-auth': 'teacher' } });
  expect(r2.ok()).toBeTruthy();

  // Student enrolls
  await context.addCookies([{ name: 'x-test-auth', value: 'student', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  const enroll = await request.post('/api/enrollments', { data: { course_id: course.id }, headers: { 'x-test-auth': 'student' } });
  expect(enroll.status()).toBe(201);

  // Visit planner page
  await page.goto('/labs/student/study-planner');
  const grid = page.getByTestId('planner-grid');
  await expect(grid).toBeVisible();
  await expect(page.getByTestId('planner-course-id').first()).toHaveText(course.id);
  await expect(page.getByTestId('planner-lesson-count').first()).toHaveText('2');
  await expect(page.getByTestId('planner-next-title').first()).toHaveText('L01');
  const reading = await page.getByTestId('planner-reading-min').first().textContent();
  expect(Number(reading)).toBeGreaterThanOrEqual(2);
});


