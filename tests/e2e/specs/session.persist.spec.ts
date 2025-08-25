import { test, expect } from '@playwright/test';

test.describe('Session persistence after login', () => {
  test('stores sb auth token and persists across refresh', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/login`, { waitUntil: 'domcontentloaded' });
    await page.fill('input[type="email"]', process.env.PLAYWRIGHT_LOGIN_EMAIL || 'admin2@expertcollege.com');
    await page.fill('input[type="password"]', process.env.PLAYWRIGHT_LOGIN_PASSWORD || 'TempPass!234');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for navigation/redirect to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });

    // Find sb auth token in localStorage
    const token = await page.evaluate(() => {
      const k = Object.keys(localStorage).find(x => x.startsWith('sb-') && x.endsWith('-auth-token'));
      return k ? localStorage.getItem(k) : null;
    });
    expect(token, 'sb auth token must be set').not.toBeNull();

    // Expect role indicator on dashboard (SSR badge)
    await expect(page.getByText(/Role:/)).toBeVisible();

    // Refresh and ensure still signed in
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/Role:/)).toBeVisible();
  });
});
