// @ts-nocheck
import { test, expect } from '@playwright/test';

test('teacher dashboard visible in test mode (no secrets)', async ({ page, context }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000');
  await context.addCookies([
    { name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }
  ]);
  await page.goto('/dashboard');
  await expect(page.getByText('Role: teacher')).toBeVisible();
});


