import { test, expect } from '@playwright/test';

test('admin reports page shows KPI tiles and links', async ({ page }) => {
  const base = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3030';
  const host = new URL(base).hostname;
  await page.context().addCookies([{ name: 'x-test-auth', value: 'admin', domain: host, path: '/' }] as any);

  await page.goto('/dashboard/admin/reports');
  await expect(page.getByRole('heading', { name: 'Reports' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Usage CSV' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Usage JSON' })).toBeVisible();
  await expect(page.getByText('Lessons')).toBeVisible();
  await expect(page.getByText('Assignments')).toBeVisible();
  await expect(page.getByText('Submissions')).toBeVisible();
});


