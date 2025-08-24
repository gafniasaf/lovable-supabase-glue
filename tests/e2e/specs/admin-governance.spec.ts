import { test, expect } from '@playwright/test';

// Assumes TEST_MODE dev server and role switch utility are available in E2E profile

test.describe('Admin governance pages (DLQ, Usage, Licenses)', () => {
  test.beforeEach(async ({ page }) => {
    // Switch to admin in TEST_MODE helper if present (no-op otherwise)
    await page.context().addCookies([{ name: 'x-test-auth', value: 'admin', url: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3030' }]);
  });

  test('DLQ page shows table and CSV link', async ({ page }) => {
    await page.goto('/dashboard/admin/dlq');
    await expect(page.getByRole('heading', { name: 'Dead Letters' })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByRole('link', { name: /Export CSV/i })).toBeVisible();
  });

  test('Usage page shows table and CSV link', async ({ page }) => {
    await page.goto('/dashboard/admin/usage');
    await expect(page.getByRole('heading', { name: 'Usage Counters' })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByRole('link', { name: /Export CSV/i })).toBeVisible();
  });

  test('Licenses page shows table and CSV link', async ({ page }) => {
    await page.goto('/dashboard/admin/licenses');
    await expect(page.getByRole('heading', { name: 'Licenses' })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.getByRole('link', { name: /Export CSV/i })).toBeVisible();
  });
});
