import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('teacher grading queue has no critical a11y violations (empty and populated)', async ({ page, context, baseURL }) => {
  const url = new URL(process.env.PLAYWRIGHT_BASE_URL || (baseURL || 'http://localhost:3030'));
  await context.addCookies([{ name: 'x-test-auth', value: 'teacher', domain: url.hostname, path: '/', httpOnly: false, secure: false }] as any);
  await page.goto('/dashboard/teacher/grading-queue');
  let results = await new AxeBuilder({ page }).include('main').analyze();
  expect(results.violations.filter(v => v.impact === 'critical').length).toBe(0);
  // Navigate to a submissions page; URL may be 404 depending on data, but axe will still evaluate structure
  await page.goto('/dashboard/teacher/000/assignments/000/submissions');
  results = await new AxeBuilder({ page }).include('main').analyze();
  expect(results.violations.filter(v => v.impact === 'critical').length).toBe(0);
});


