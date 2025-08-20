// @ts-nocheck
import { test, expect } from '@playwright/test';

test('teacher can create a lesson and list it (test-mode)', async ({ page, context }) => {
  // Create a course first (via API) while holding the cookie for SSR + API
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000');
  await context.addCookies([
    { name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }
  ]);
  const title = `Course ${Date.now()}`;
  const courseRes = await page.request.post('/api/courses', { data: { title, description: 'tmp' }, headers: { 'x-test-auth': 'teacher' } });
  expect(courseRes.ok()).toBeTruthy();
  const course = await courseRes.json();

  // Create lesson via API
  const lessonRes = await page.request.post('/api/lessons', { data: { course_id: course.id, title: 'L01', content: 'Body', order_index: 1 }, headers: { 'x-test-auth': 'teacher' } });
  expect(lessonRes.ok()).toBeTruthy();

  // Visit course page and verify lesson list
  await page.goto(`/dashboard/teacher/${course.id}`);
  await expect(page.getByRole('heading', { name: 'Lessons' })).toBeVisible();
  await expect(page.getByText('#1 - L01')).toBeVisible();
});


