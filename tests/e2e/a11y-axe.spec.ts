import { test, expect } from '@playwright/test';

test('no obvious accessibility issues on courses page (landmarks present)', async ({ page, baseURL }) => {
  const root = (baseURL || 'http://127.0.0.1:3077').replace(/\/$/, '');
  await page.goto(`${root}/edu/courses`, { waitUntil: 'domcontentloaded' });
  // Lightweight check without extra deps
  const html = await page.content();
  expect(html).toMatch(/role="banner"/i);
  expect(html).toMatch(/aria-label="Primary"/i);
});


