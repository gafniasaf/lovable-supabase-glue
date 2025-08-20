// @ts-nocheck
import { test, expect } from '@playwright/test';

test.describe('Admin parent links UI', () => {
  test.beforeEach(async ({ request }) => {
    const resp = await request.post('/api/test/reset');
    expect(resp.ok()).toBeTruthy();
  });

  test('admin can add and remove parent links', async ({ context, page, baseURL }) => {
    const base = new URL(process.env.PLAYWRIGHT_BASE_URL || (baseURL || 'http://localhost:3030'));
    await context.addCookies([{ name: 'x-test-auth', value: 'admin', domain: base.hostname, path: '/', httpOnly: false, secure: false }]);
    const parentId = 'parent-1234';
    await page.goto(`/dashboard/admin/parent-links?parent_id=${parentId}`);
    await expect(page.getByTestId('add-link-form')).toBeVisible();
    await page.getByTestId('student-id-input').fill('student-5678');
    await page.getByTestId('add-link-btn').click();
    await expect(page.getByTestId('links-list')).toBeVisible();
    await expect(page.getByTestId('link-student').first()).toHaveText('student-5678');
    await page.getByTestId('remove-link-btn').first().click();
    await page.waitForTimeout(200);
  });
});



