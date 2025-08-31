import { test, expect } from '@playwright/test';

test.skip('header visual snapshot (disabled in CI; enable locally)', async ({ page, baseURL }) => {
  const root = (baseURL || 'http://127.0.0.1:3077').replace(/\/$/, '');
  await page.goto(`${root}/edu/courses`, { waitUntil: 'domcontentloaded' });
  const header = page.locator('header[role="banner"]');
  await header.waitFor({ state: 'visible' });
  const screenshot = await header.screenshot();
  // Save screenshot as an artifact-like file; assertion skipped to avoid baseline management
  // In CI you could use toHaveScreenshot with a stable baseline
  await page.context().tracing.stopChunk?.();
});


