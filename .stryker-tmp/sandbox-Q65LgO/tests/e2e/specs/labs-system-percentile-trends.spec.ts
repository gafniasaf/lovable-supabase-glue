// @ts-nocheck
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  let resp = await request.post('/api/__test__/reset');
  if (resp.status() === 404) resp = await request.post('/api/test/reset');
  expect(resp.ok()).toBeTruthy();
});

test('percentile trends shows 5 windows and 25 overall samples', async ({ page }) => {
  await page.goto('/labs/system/percentile-trends');
  await expect(page.getByTestId('trends-window-count')).toHaveText('5');
  await expect(page.getByTestId('trends-overall-sample-count')).toHaveText('25');
  const rows = page.getByTestId('trends-window-row');
  await expect(rows).toHaveCount(5);
  await expect(rows.first().getByTestId('trends-window-index')).toHaveText('1');
  await expect(rows.first().getByTestId('trends-window-p50')).toBeVisible();
});


