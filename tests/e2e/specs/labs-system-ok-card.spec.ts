import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  let resp = await request.post('/api/test/reset');
  if (resp.status() === 404) {
    resp = await request.post('/api/__test__/reset');
  }
  expect(resp.ok()).toBeTruthy();
});

test('ok card shows ok=true and humanized ts', async ({ page }) => {
  await page.goto('/labs/system/ok-card');
  await expect(page.getByTestId('ok-value')).toHaveText('true');
  const tsText = await page.getByTestId('ts-human').innerText();
  expect(tsText).toMatch(/ago/);
});

