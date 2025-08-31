import { test, expect } from '@playwright/test';

test('assignments page renders', async ({ page, baseURL }) => {
  const url = `${(baseURL || 'http://127.0.0.1:3077').replace(/\/$/, '')}/edu/assignments`;
  await page.goto(url);
  await expect(page.locator('body')).toBeVisible();
});



