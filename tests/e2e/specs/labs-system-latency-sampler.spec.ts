import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  let resp = await request.post('/api/__test__/reset');
  if (resp.status() === 404) resp = await request.post('/api/test/reset');
  expect(resp.ok()).toBeTruthy();
});

test('latency sampler shows min/avg/max and sample count = 5', async ({ page }) => {
  await page.goto('/labs/system/latency-sampler');
  await expect(page.getByTestId('latency-min')).toBeVisible();
  await expect(page.getByTestId('latency-avg')).toBeVisible();
  await expect(page.getByTestId('latency-max')).toBeVisible();
  await expect(page.getByTestId('latency-sample-count')).toHaveText('5');
});


