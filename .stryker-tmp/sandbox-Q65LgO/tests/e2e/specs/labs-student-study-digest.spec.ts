// @ts-nocheck
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  let resp = await request.post('/api/__test__/reset');
  if (resp.status() === 404) resp = await request.post('/api/test/reset');
  expect(resp.ok()).toBeTruthy();
});

test('study digest shows next 3 and CSV link', async ({ page, context, request }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000');

  // Seed: teacher creates course and 3 lessons with increasing content sizes
  await context.addCookies([{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  const courseRes = await request.post('/api/courses', { data: { title: `Course ${Date.now()}`, description: 'D' }, headers: { 'x-test-auth': 'teacher' } });
  expect(courseRes.status()).toBe(201);
  const course = await courseRes.json();
  const contents = ['a'.repeat(300), 'a'.repeat(800), 'a'.repeat(1200)];
  for (let i = 1; i <= 3; i++) {
    const r = await request.post('/api/lessons', { data: { course_id: course.id, title: `L0${i}`, content: contents[i-1], order_index: i }, headers: { 'x-test-auth': 'teacher' } });
    expect(r.ok()).toBeTruthy();
  }

  // Student enrolls
  await context.addCookies([{ name: 'x-test-auth', value: 'student', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  const enroll = await request.post('/api/enrollments', { data: { course_id: course.id }, headers: { 'x-test-auth': 'student' } });
  expect(enroll.status()).toBe(201);

  // Visit page and assert
  await page.goto('/labs/student/study-digest');
  const grid = page.getByTestId('digest-grid');
  await expect(grid).toBeVisible();
  // Scope assertions to the card that matches our course id
  const card = page.getByTestId('digest-card').filter({ has: page.getByTestId('digest-course-id').getByText(course.id) });
  await expect(card).toHaveCount(1);
  const titles = await card.getByTestId('digest-next-title').allTextContents();
  expect(titles.join(' ')).toContain('L01');
  expect(titles.join(' ')).toContain('L02');
  expect(titles.join(' ')).toContain('L03');
  const readingText = await card.getByTestId('digest-reading-min').first().textContent();
  expect(Number(readingText)).toBeGreaterThanOrEqual(3);
  await expect(page.getByTestId('digest-csv-link')).toBeVisible();
});


