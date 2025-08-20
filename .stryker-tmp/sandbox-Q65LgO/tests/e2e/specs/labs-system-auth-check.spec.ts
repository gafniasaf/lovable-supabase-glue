// @ts-nocheck
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  let resp = await request.post('/api/test/reset');
  if (resp.status() === 404) {
    resp = await request.post('/api/__test__/reset');
  }
  expect(resp.ok()).toBeTruthy();
});

test('without cookie shows sign-in prompt and link', async ({ page }) => {
  await page.goto('/labs/system/auth-check');
  await expect(page.getByText('You are not signed in')).toBeVisible();
  const link = page.getByRole('link', { name: 'Sign in' });
  await expect(link).toHaveAttribute('href', '/login');
});

test('with student auth shows email and role', async ({ page, context }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3020');
  await context.addCookies([
    { name: 'x-test-auth', value: 'student', domain: base.hostname, path: '/', httpOnly: false, secure: false }
  ]);

  await page.goto('/labs/system/auth-check');
  const role = page.getByTestId('auth-role');
  const email = page.getByTestId('auth-email');
  await expect(role).toHaveText('student');
  const emailText = await email.innerText();
  expect(emailText).toContain('@');
  expect(emailText.length).toBeGreaterThan(3);
});



