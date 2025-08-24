import { test, expect } from '@playwright/test';

test('admin metrics page renders tables and links', async ({ page, request }) => {
  // ensure admin auth for SSR-fetch
  await page.context().addCookies([{ name: 'x-test-auth', value: 'admin', domain: new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3030').hostname, path: '/' }] as any);
  await page.goto('/dashboard/admin/metrics');
  await expect(page.getByRole('heading', { name: 'Metrics' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'JSON' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Text (Prometheus)' })).toBeVisible();
  await expect(page.getByRole('table').nth(0)).toBeVisible();
  await expect(page.getByRole('table').nth(1)).toBeVisible();
});


