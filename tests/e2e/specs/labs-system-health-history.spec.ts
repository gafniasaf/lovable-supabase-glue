import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  let resp = await request.post('/api/__test__/reset');
  if (resp.status() === 404) resp = await request.post('/api/test/reset');
  expect(resp.ok()).toBeTruthy();
});

test('health history shows 10 samples and delta metrics', async ({ page }) => {
  await page.goto('/labs/system/health-history');
  await expect(page.getByTestId('history-sample-count')).toHaveText('10');
  await expect(page.getByTestId('history-min-delta')).toBeVisible();
  await expect(page.getByTestId('history-avg-delta')).toBeVisible();
  await expect(page.getByTestId('history-max-delta')).toBeVisible();
  const items = page.getByTestId('history-item');
  await expect(items.first()).toBeVisible();
});


