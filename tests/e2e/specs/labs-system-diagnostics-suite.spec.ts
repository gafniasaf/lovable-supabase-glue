import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  let resp = await request.post('/api/__test__/reset');
  if (resp.status() === 404) resp = await request.post('/api/test/reset');
  expect(resp.ok()).toBeTruthy();
});

test('diagnostics suite shows batch and overall metrics', async ({ page }) => {
  await page.goto('/labs/system/diagnostics-suite');
  await expect(page.getByTestId('diag-batch-sample-count-10')).toHaveText('10');
  await expect(page.getByTestId('diag-batch-sample-count-20')).toHaveText('20');
  await expect(page.getByTestId('diag-batch-sample-count-30')).toHaveText('30');

  await expect(page.getByTestId('diag-overall-sample-count')).toHaveText('60');

  await expect(page.getByTestId('diag-batch-min-10')).toBeVisible();
  await expect(page.getByTestId('diag-batch-avg-20')).toBeVisible();
  await expect(page.getByTestId('diag-batch-max-30')).toBeVisible();
  await expect(page.getByTestId('diag-batch-p50-10')).toBeVisible();
  await expect(page.getByTestId('diag-batch-p95-20')).toBeVisible();

  await expect(page.getByTestId('diag-overall-min')).toBeVisible();
  await expect(page.getByTestId('diag-overall-avg')).toBeVisible();
  await expect(page.getByTestId('diag-overall-max')).toBeVisible();
  await expect(page.getByTestId('diag-overall-p50')).toBeVisible();
  await expect(page.getByTestId('diag-overall-p95')).toBeVisible();
});


