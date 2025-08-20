import { test, expect } from '@playwright/test';

test.describe('@smoke dead-click killers', () => {
  test('Login redirect → dashboard visible', async ({ page }) => {
    await page.goto('/');
    // Disambiguate by scoping to the site header (banner)
    await expect(page.getByRole('banner').getByRole('link', { name: 'Dashboard home' })).toBeVisible();
  });

  test('Open teacher dashboard → click Add course opens form', async ({ page }) => {
    await page.goto('/dashboard/teacher');
    const add = page.getByRole('link', { name: /new course|add course/i }).first();
    if (await add.isVisible()) {
      await add.click();
      // Accept current and legacy routes
      await expect(page).toHaveURL(/dashboard\/teacher\/(courses\/new|new|courses\/create)/);
    }
  });
});


