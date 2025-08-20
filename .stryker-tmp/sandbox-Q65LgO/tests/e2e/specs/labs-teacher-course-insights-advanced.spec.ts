// @ts-nocheck
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  let resp = await request.post('/api/test/reset');
  if (resp.status() === 404) {
    resp = await request.post('/api/__test__/reset');
  }
  expect(resp.ok()).toBeTruthy();
});

test('course insights advanced shows rows, totals, and CSV link', async ({ page, context, request }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000');
  await context.addCookies([
    { name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }
  ]);

  // Seed Course A with two lessons
  const A = await request.post('/api/courses', { data: { title: `Course A ${Date.now()}`, description: 'A' }, headers: { 'x-test-auth': 'teacher' } });
  expect(A.ok()).toBeTruthy();
  const courseA = await A.json();
  const a1 = await request.post('/api/lessons', { data: { course_id: courseA.id, title: 'L01', content: '', order_index: 1 }, headers: { 'x-test-auth': 'teacher' } });
  const a2 = await request.post('/api/lessons', { data: { course_id: courseA.id, title: 'L02', content: '', order_index: 2 }, headers: { 'x-test-auth': 'teacher' } });
  expect(a1.ok() && a2.ok()).toBeTruthy();

  // Seed Course B with one lesson
  const B = await request.post('/api/courses', { data: { title: `Course B ${Date.now()}`, description: 'B' }, headers: { 'x-test-auth': 'teacher' } });
  expect(B.ok()).toBeTruthy();
  const courseB = await B.json();
  const b1 = await request.post('/api/lessons', { data: { course_id: courseB.id, title: 'L11', content: '', order_index: 1 }, headers: { 'x-test-auth': 'teacher' } });
  expect(b1.ok()).toBeTruthy();

  await page.goto('/labs/teacher/course-insights-advanced');
  await expect(page.getByTestId('insights-table')).toBeVisible();

  const rowA = page.getByTestId('insights-row').filter({ hasText: courseA.id });
  await expect(rowA.getByTestId('cell-lesson-count')).toHaveText('2');
  await expect(rowA.getByTestId('cell-first-lesson')).toHaveText('L01');
  await expect(rowA.getByTestId('cell-last-lesson')).toHaveText('L02');

  const rowB = page.getByTestId('insights-row').filter({ hasText: courseB.id });
  await expect(rowB.getByTestId('cell-lesson-count')).toHaveText('1');
  await expect(rowB.getByTestId('cell-first-lesson')).toHaveText('L11');
  await expect(rowB.getByTestId('cell-last-lesson')).toHaveText('L11');

  await expect(page.getByTestId('insights-total-courses')).toHaveText('2');
  await expect(page.getByTestId('insights-total-lessons')).toHaveText('3');

  const csvLink = page.getByTestId('insights-csv-link');
  await expect(csvLink).toBeVisible();
  await expect(csvLink).toHaveAttribute('href', /^(data:text\/csv)/);
});


