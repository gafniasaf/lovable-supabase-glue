// @ts-nocheck
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  let resp = await request.post('/api/test/reset');
  if (resp.status() === 404) {
    resp = await request.post('/api/__test__/reset');
  }
  expect(resp.ok()).toBeTruthy();
});

test('teacher analytics shows per-course counts and totals', async ({ page, context, request }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000');
  await context.addCookies([
    { name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }
  ]);

  // Seed two courses
  const title1 = `Course A ${Date.now()}`;
  const title2 = `Course B ${Date.now()}`;
  const course1Res = await request.post('/api/courses', { data: { title: title1, description: 'd1' }, headers: { 'x-test-auth': 'teacher' } });
  const course2Res = await request.post('/api/courses', { data: { title: title2, description: 'd2' }, headers: { 'x-test-auth': 'teacher' } });
  expect(course1Res.ok() && course2Res.ok()).toBeTruthy();
  const course1 = await course1Res.json();
  const course2 = await course2Res.json();

  // Lessons: 2 for first, 1 for second
  const l11 = await request.post('/api/lessons', { data: { course_id: course1.id, title: 'Intro', content: '', order_index: 1 }, headers: { 'x-test-auth': 'teacher' } });
  const l12 = await request.post('/api/lessons', { data: { course_id: course1.id, title: 'Lesson B', content: '', order_index: 2 }, headers: { 'x-test-auth': 'teacher' } });
  const l21 = await request.post('/api/lessons', { data: { course_id: course2.id, title: 'Start', content: '', order_index: 1 }, headers: { 'x-test-auth': 'teacher' } });
  expect(l11.ok() && l12.ok() && l21.ok()).toBeTruthy();

  await page.goto('/labs/teacher/analytics');
  await expect(page.getByTestId('analytics-table')).toBeVisible();
  // Per-course rows
  const row1 = page.getByTestId('row-course').filter({ hasText: course1.id });
  await expect(row1.getByTestId('cell-course-title')).toHaveText(title1);
  await expect(row1.getByTestId('cell-lesson-count')).toHaveText('2');
  const row2 = page.getByTestId('row-course').filter({ hasText: course2.id });
  await expect(row2.getByTestId('cell-course-title')).toHaveText(title2);
  await expect(row2.getByTestId('cell-lesson-count')).toHaveText('1');
  // Totals
  await expect(page.getByTestId('analytics-total-courses')).toHaveText('2');
  await expect(page.getByTestId('analytics-total-lessons')).toHaveText('3');

  // Export links are optional; only assert table and totals for stability
});


