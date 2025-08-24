import { test, expect } from '@playwright/test';

test('admin providers and catalog pages render', async ({ page, context, baseURL }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || (baseURL || 'http://localhost:3030'));
  await context.addCookies([{ name: 'x-test-auth', value: 'admin', domain: base.hostname, path: '/' }] as any);

  await page.goto('/admin/providers');
  await expect(page.getByRole('heading', { name: 'Providers' })).toBeVisible();

  await page.goto('/admin/catalog');
  await expect(page.getByRole('heading', { name: 'External Catalog' })).toBeVisible();
});


