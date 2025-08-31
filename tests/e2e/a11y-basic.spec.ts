import { test, expect } from '@playwright/test';

test('basic a11y landmarks present', async ({ page, baseURL }) => {
  const root = (baseURL || 'http://127.0.0.1:3077').replace(/\/$/, '');
  await page.goto(`${root}/edu/courses`, { waitUntil: 'domcontentloaded' });
  const html = await page.content();
  expect(html).toMatch(/role="banner"/i);
  expect(html).toMatch(/aria-label="Primary"/i);
});


