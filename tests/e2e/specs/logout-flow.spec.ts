import { test, expect } from '@playwright/test';

test('logout clears role (WhoAmI shows anonymous) @smoke', async ({ page, context, baseURL }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || (baseURL || 'http://localhost:3030'));
  await context.addCookies([{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }] as any);
  await page.goto('/dashboard');
  await expect(page.getByTestId('whoami-role')).toHaveText('teacher');
  await page.getByTestId('signout-btn').click();
  await expect(page.getByTestId('whoami-role')).toHaveText('anonymous');
});


