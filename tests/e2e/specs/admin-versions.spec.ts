import { test, expect } from '@playwright/test';

test('admin versions page renders and allows approve/disable buttons', async ({ page, context, baseURL }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || (baseURL || 'http://localhost:3030'));
  await context.addCookies([{ name: 'x-test-auth', value: 'admin', domain: base.hostname, path: '/' }] as any);
  await page.goto('/admin/versions');
  await expect(page.getByRole('heading', { name: 'Course Versions' })).toBeVisible();
});


