import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('student assignment detail has no critical a11y violations', async ({ page, context, baseURL }) => {
  const url = new URL(process.env.PLAYWRIGHT_BASE_URL || (baseURL || 'http://localhost:3030'));
  await context.addCookies([{ name: 'x-test-auth', value: 'student', domain: url.hostname, path: '/', httpOnly: false, secure: false }] as any);
  await page.goto('/dashboard/student/00000000-0000-0000-0000-000000000000/assignments/00000000-0000-0000-0000-000000000001');
  const accessibilityScanResults = await new AxeBuilder({ page }).include('main').analyze();
  const critical = accessibilityScanResults.violations.filter(v => v.impact === 'critical');
  expect(critical.length).toBe(0);
});


