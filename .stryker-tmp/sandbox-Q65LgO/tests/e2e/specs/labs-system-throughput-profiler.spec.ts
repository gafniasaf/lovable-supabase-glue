// @ts-nocheck
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  let resp = await request.post('/api/__test__/reset');
  if (resp.status() === 404) resp = await request.post('/api/test/reset');
  expect(resp.ok()).toBeTruthy();
});

test('throughput profiler shows bursts and chart JSON link', async ({ page }) => {
  await page.goto('/labs/system/throughput-profiler');
  await expect(page.getByTestId('tp-overall-bursts')).toHaveText('4');
  await expect(page.getByTestId('tp-download-chart-json')).toHaveAttribute('href', /data:application\/json/);

  for (const size of [5, 10, 20, 40]) {
    await expect(page.getByTestId(`tp-burst-sample-count-${size}`)).toHaveText(String(size));
    await expect(page.getByTestId(`tp-burst-rps-${size}`)).toBeVisible();
    await expect(page.getByTestId(`tp-burst-min-${size}`)).toBeVisible();
    await expect(page.getByTestId(`tp-burst-avg-${size}`)).toBeVisible();
    await expect(page.getByTestId(`tp-burst-max-${size}`)).toBeVisible();
    await expect(page.getByTestId(`tp-burst-p50-${size}`)).toBeVisible();
    await expect(page.getByTestId(`tp-burst-p95-${size}`)).toBeVisible();
  }
});


