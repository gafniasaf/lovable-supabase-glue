// @ts-nocheck
import { test, expect } from '@playwright/test';

// This test demonstrates injecting a Supabase session cookie so protected pages load without UI login.
// Requires having a valid access token (short-lived) from Supabase auth; for demo, we assert redirect to /login otherwise.

test('dashboard requires auth (skipped in test-mode)', async ({ page, request }) => {
  const h = await request.get('/api/health');
  const mode = h.ok() ? (await h.json()) : {};
  if (mode.testRole) return; // SSR bypass active
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login/);
});

// Example of cookie injection (replace with a valid token during CI setup)
// test('can open dashboard with injected session', async ({ page, context }) => {
//   await context.addCookies([
//     {
//       name: 'sb-access-token',
//       value: process.env.PW_SUPABASE_ACCESS_TOKEN!,
//       domain: 'localhost',
//       path: '/',
//       httpOnly: false,
//       secure: false
//     },
//     {
//       name: 'sb-refresh-token',
//       value: process.env.PW_SUPABASE_REFRESH_TOKEN!,
//       domain: 'localhost',
//       path: '/',
//       httpOnly: false,
//       secure: false
//     }
//   ]);
//   await page.goto('/dashboard');
//   await expect(page).toHaveURL(/\/dashboard/);
// });


