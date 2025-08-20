// @ts-nocheck
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  let resp = await request.post('/api/__test__/reset');
  if (resp.status() === 404) resp = await request.post('/api/test/reset');
  expect(resp.ok()).toBeTruthy();
});

test('request id is present on labs page', async ({ page }) => {
  await page.goto('/labs/system/request-id');
  await expect(page.getByTestId('request-id')).toBeVisible();
  const present = await page.getByTestId('request-id-present').textContent();
  expect(present).toBe('true');
});


