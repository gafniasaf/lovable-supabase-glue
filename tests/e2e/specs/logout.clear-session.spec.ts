import { test, expect } from '@playwright/test';

test.describe('Logout clears session', () => {
  test('sign out removes sb token and shows anonymous', async ({ page, baseURL }) => {
    // Ensure we are logged in first
    await page.goto(`${baseURL}/login`, { waitUntil: 'domcontentloaded' });
    await page.fill('input[type="email"]', process.env.PLAYWRIGHT_LOGIN_EMAIL || 'admin2@expertcollege.com');
    await page.fill('input[type="password"]', process.env.PLAYWRIGHT_LOGIN_PASSWORD || 'TempPass!234');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });

    // Click Sign out button in header
    await page.getByTestId('signout-btn').click({ timeout: 10000 });

    // After sign out, either redirected or role shows anonymous
    await page.waitForLoadState('domcontentloaded');
    const roleText = await page.getByTestId('whoami-role').innerText();
    expect(roleText.toLowerCase()).toContain('anonymous');

    // Ensure localStorage token removed
    const hasToken = await page.evaluate(() => {
      const k = Object.keys(localStorage).find(x => x.startsWith('sb-') && x.endsWith('-auth-token'));
      return !!k && !!localStorage.getItem(k);
    });
    expect(hasToken).toBeFalsy();
  });
});
