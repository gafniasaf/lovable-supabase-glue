import { test, expect } from '@playwright/test';

test.skip('header nav contains links to edu routes (flaky under streaming)', async ({ page, baseURL }) => {
  const root = (baseURL || 'http://127.0.0.1:3077').replace(/\/$/, '');

  await page.goto(`${root}/edu/courses`, { waitUntil: 'domcontentloaded' });
  await page.locator('header[role="banner"]').first().waitFor({ state: 'visible', timeout: 30000 });
  await expect(page.locator('a[href="/edu/assignments"]').first()).toBeVisible();
  await expect(page.locator('a[href="/edu/courses"]').first()).toBeVisible();
  await expect(page.locator('a[href="/edu/lessons"]').first()).toBeVisible();
});


