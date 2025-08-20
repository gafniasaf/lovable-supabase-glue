import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  let resp = await request.post('/api/test/reset');
  if (resp.status() === 404) resp = await request.post('/api/__test__/reset');
  expect(resp.ok()).toBeTruthy();
});

test('teacher announcements lists created rows for selected course', async ({ page, context, request }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3020');
  await context.addCookies([{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);

  // Create a course
  const courseRes = await request.post('/api/courses', { data: { title: `Course ${Date.now()}`, description: 'D' }, headers: { 'x-test-auth': 'teacher' } });
  expect(courseRes.status()).toBe(201);
  const course = await courseRes.json();

  // Create announcements
  const a1 = await request.post('/api/announcements', { data: { course_id: course.id, title: 'Welcome', body: 'Hello students' }, headers: { 'x-test-auth': 'teacher' } });
  expect(a1.status()).toBe(201);
  const a2 = await request.post('/api/announcements', { data: { course_id: course.id, title: 'Schedule', body: 'Next week...' }, headers: { 'x-test-auth': 'teacher' } });
  expect(a2.status()).toBe(201);

  // Visit teacher announcements page for this course
  await page.goto(`/labs/teacher/announcements?course_id=${course.id}`);
  const list = page.getByTestId('ann-list');
  await expect(list).toBeVisible();
  const titles = await list.getByTestId('ann-title').allTextContents();
  expect(titles.join(' ')).toContain('Welcome');
  expect(titles.join(' ')).toContain('Schedule');
});


