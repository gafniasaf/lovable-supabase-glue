import { test, expect } from '@playwright/test';

test('lessons page renders', async ({ page, baseURL }) => {
  const url = `${(baseURL || 'http://127.0.0.1:3077').replace(/\/$/, '')}/edu/lessons`;
  await page.goto(url);
  await expect(page.locator('body')).toBeVisible();
});



