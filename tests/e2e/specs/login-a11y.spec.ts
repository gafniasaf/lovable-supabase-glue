import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('login a11y', async ({ page }) => {
  await page.goto('/login');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});


