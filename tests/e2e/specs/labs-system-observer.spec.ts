import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  let resp = await request.post('/api/__test__/reset');
  if (resp.status() === 404) resp = await request.post('/api/test/reset');
  expect(resp.ok()).toBeTruthy();
});

test('observer shows sample count 20 and percentile metrics', async ({ page }) => {
  await page.goto('/labs/system/observer');
  await expect(page.getByTestId('observer-sample-count')).toHaveText('20');
  await expect(page.getByTestId('observer-min')).toBeVisible();
  await expect(page.getByTestId('observer-avg')).toBeVisible();
  await expect(page.getByTestId('observer-max')).toBeVisible();
  await expect(page.getByTestId('observer-p50')).toBeVisible();
  await expect(page.getByTestId('observer-p95')).toBeVisible();
  await expect(page.getByTestId('observer-p99')).toBeVisible();
});


