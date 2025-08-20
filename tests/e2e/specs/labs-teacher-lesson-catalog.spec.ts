import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  let resp = await request.post('/api/test/reset');
  if (resp.status() === 404) {
    resp = await request.post('/api/__test__/reset');
  }
  expect(resp.ok()).toBeTruthy();
});

test('lesson catalog search and sorting with CSV link', async ({ page, context, request }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000');
  await context.addCookies([
    { name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }
  ]);

  // Seed two courses
  const titleA = `Course A ${Date.now()}`;
  const titleB = `Course B ${Date.now()}`;
  const A = await request.post('/api/courses', { data: { title: titleA, description: 'A' }, headers: { 'x-test-auth': 'teacher' } });
  const B = await request.post('/api/courses', { data: { title: titleB, description: 'B' }, headers: { 'x-test-auth': 'teacher' } });
  expect(A.ok() && B.ok()).toBeTruthy();
  const courseA = await A.json();
  const courseB = await B.json();

  // Lessons: A -> Alpha, Omega; B -> Beta
  const la = await request.post('/api/lessons', { data: { course_id: courseA.id, title: 'Alpha', content: 'aaaaa', order_index: 1 }, headers: { 'x-test-auth': 'teacher' } });
  const lo = await request.post('/api/lessons', { data: { course_id: courseA.id, title: 'Omega', content: 'oooooooooo', order_index: 2 }, headers: { 'x-test-auth': 'teacher' } });
  const lb = await request.post('/api/lessons', { data: { course_id: courseB.id, title: 'Beta', content: 'bbb', order_index: 1 }, headers: { 'x-test-auth': 'teacher' } });
  expect(la.ok() && lo.ok() && lb.ok()).toBeTruthy();

  // Search q=al -> only Alpha
  await page.goto('/labs/teacher/lesson-catalog?q=al');
  await expect(page.getByTestId('catalog-table')).toBeVisible();
  const rowsFiltered = page.getByTestId('catalog-row');
  await expect(rowsFiltered).toHaveCount(1);
  await expect(rowsFiltered.first().getByTestId('cell-lesson-title')).toHaveText('Alpha');
  await expect(page.getByTestId('catalog-total-rows')).toHaveText('1');
  await expect(page.getByTestId('catalog-csv-link')).toHaveAttribute('href', /^(data:text\/csv)/);

  // Sort by content desc
  await page.goto('/labs/teacher/lesson-catalog?sort=content&dir=desc');
  const rowsSorted = page.getByTestId('catalog-row');
  // Find indices of our specific rows to assert relative order
  const rowOmega = rowsSorted.filter({ has: page.getByTestId('cell-course-title').filter({ hasText: titleA }) }).filter({ has: page.getByTestId('cell-lesson-title').filter({ hasText: 'Omega' }) });
  const rowAlpha = rowsSorted.filter({ has: page.getByTestId('cell-course-title').filter({ hasText: titleA }) }).filter({ has: page.getByTestId('cell-lesson-title').filter({ hasText: 'Alpha' }) });
  const rowBeta = rowsSorted.filter({ has: page.getByTestId('cell-course-title').filter({ hasText: titleB }) }).filter({ has: page.getByTestId('cell-lesson-title').filter({ hasText: 'Beta' }) });
  await expect(rowOmega).toHaveCount(1);
  await expect(rowAlpha).toHaveCount(1);
  await expect(rowBeta).toHaveCount(1);
  const omegaIndex = await rowOmega.evaluate((el) => Array.from(el.parentElement!.children).indexOf(el));
  const alphaIndex = await rowAlpha.evaluate((el) => Array.from(el.parentElement!.children).indexOf(el));
  const betaIndex = await rowBeta.evaluate((el) => Array.from(el.parentElement!.children).indexOf(el));
  expect(omegaIndex).toBeLessThan(alphaIndex);
  expect(alphaIndex).toBeLessThan(betaIndex);
});


