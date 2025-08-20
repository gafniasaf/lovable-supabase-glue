import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('notifications dropdown and mark-all flow are a11y clean', async ({ page, context, baseURL }) => {
  const url = new URL(process.env.PLAYWRIGHT_BASE_URL || (baseURL || 'http://localhost:3030'));
  await context.addCookies([{ name: 'x-test-auth', value: 'student', domain: url.hostname, path: '/', httpOnly: false, secure: false }] as any);
  await page.goto('/dashboard');
  // Open notifications dropdown (header bell)
  await page.getByTestId('notif-bell').locator('summary').click();
  let results = await new AxeBuilder({ page }).include('main').analyze();
  expect(results.violations.filter(v => v.impact === 'critical').length).toBe(0);
  // Navigate to inbox and mark all
  await page.getByRole('link', { name: /open inbox/i }).click();
  await page.getByRole('button', { name: /mark all/i }).click();
  results = await new AxeBuilder({ page }).include('main').analyze();
  expect(results.violations.filter(v => v.impact === 'critical').length).toBe(0);
});


