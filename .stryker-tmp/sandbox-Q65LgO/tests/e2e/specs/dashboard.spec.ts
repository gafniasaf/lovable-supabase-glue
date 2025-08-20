// @ts-nocheck
import { test, expect } from '@playwright/test';

async function isTestMode(request: any) {
  const res = await request.get('/api/health');
  if (!res.ok()) return false;
  const j = await res.json();
  return !!j.testRole;
}

test('health endpoint ok @smoke', async ({ request }) => {
  const res = await request.get('/api/health');
  expect(res.ok()).toBeTruthy();
  const j = await res.json();
  expect(j.ok).toBe(true);
});

test('redirect to login when unauthenticated', async ({ page, request }) => {
  if (await isTestMode(request)) return; // skip redirect check in test-mode SSR bypass
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login/);
});


