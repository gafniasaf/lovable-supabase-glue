import { test, expect } from '@playwright/test';

test('edu sandbox renders', async ({ page, baseURL }) => {
  const url = `${(baseURL || 'http://127.0.0.1:3077').replace(/\/$/, '')}/edu/sandbox`;
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  const html = await page.content();
  expect(html).toMatch(/EduPlatform/i);
});


