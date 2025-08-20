import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  let resp = await request.post('/api/__test__/reset');
  if (resp.status() === 404) resp = await request.post('/api/test/reset');
  expect(resp.ok()).toBeTruthy();
});

test('latency histogram shows 100 samples and bins sum to 100', async ({ page }) => {
  await page.goto('/labs/system/latency-histogram');
  await expect(page.getByTestId('hist-sample-count')).toHaveText('100');
  const n1 = parseInt(await page.getByTestId('hist-bin-0-49').textContent() || '0', 10);
  const n2 = parseInt(await page.getByTestId('hist-bin-50-99').textContent() || '0', 10);
  const n3 = parseInt(await page.getByTestId('hist-bin-100-199').textContent() || '0', 10);
  const n4 = parseInt(await page.getByTestId('hist-bin-200-499').textContent() || '0', 10);
  const n5 = parseInt(await page.getByTestId('hist-bin-500plus').textContent() || '0', 10);
  const sum = n1 + n2 + n3 + n4 + n5;
  expect(sum).toBe(100);
  await expect(page.getByTestId('hist-bin-total')).toHaveText('100');
});


