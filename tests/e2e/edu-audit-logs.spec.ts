import { test, expect } from '@playwright/test';

test('audit logs page renders', async ({ page, baseURL }) => {
  const url = `${(baseURL || 'http://127.0.0.1:3077').replace(/\/$/, '')}/edu/audit-logs`;
  await page.goto(url);
  await expect(page.locator('body')).toBeVisible();
});



