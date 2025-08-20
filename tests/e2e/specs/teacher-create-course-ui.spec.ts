import { test, expect } from '@playwright/test';

test('teacher can create course via UI and sees success banner', async ({ page, context }) => {
  const base = new URL(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000');
  await context.addCookies([{ name: 'x-test-auth', value: 'teacher', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
  await page.goto('/dashboard/teacher/new');
  const title = `UI Course ${Date.now()}`;
  await page.getByPlaceholder('Title').fill(title);
  await page.getByPlaceholder('Description').fill('UI flow');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByText('Created!')).toBeVisible();
});
