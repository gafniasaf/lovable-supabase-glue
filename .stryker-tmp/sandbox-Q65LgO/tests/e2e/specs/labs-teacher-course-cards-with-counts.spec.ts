// @ts-nocheck
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  let resp = await request.post('/api/test/reset');
  if (resp.status() === 404) {
    resp = await request.post('/api/__test__/reset');
  }
  expect(resp.ok()).toBeTruthy();
});

test('teacher course cards show lesson counts (SSR)', async ({ page, context, request }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000');
  await context.addCookies([
    { name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }
  ]);

  const title = `Course ${Date.now()}`;
  const createCourse = await request.post('/api/courses', { data: { title, description: 'tmp' }, headers: { 'x-test-auth': 'teacher' } });
  expect(createCourse.ok()).toBeTruthy();
  const course = await createCourse.json();

  // Seed two lessons
  const l1 = await request.post('/api/lessons', { data: { course_id: course.id, title: 'Alpha', content: '', order_index: 1 }, headers: { 'x-test-auth': 'teacher' } });
  const l2 = await request.post('/api/lessons', { data: { course_id: course.id, title: 'Bravo', content: '', order_index: 2 }, headers: { 'x-test-auth': 'teacher' } });
  expect(l1.ok() && l2.ok()).toBeTruthy();

  // Sanity check via API
  const list = await request.get('/api/courses', { headers: { 'x-test-auth': 'teacher' } });
  expect(list.ok()).toBeTruthy();

  await page.goto('/labs/teacher/course-cards-with-counts');
  await expect(page.getByTestId('courses-grid')).toBeVisible();
  const titleLocator = page.getByTestId('course-title').filter({ hasText: title });
  await expect(titleLocator).toBeVisible();
  const card = page.getByTestId('course-card').filter({ has: titleLocator });
  await expect(card.getByTestId('course-lesson-count')).toHaveText('2');
});


