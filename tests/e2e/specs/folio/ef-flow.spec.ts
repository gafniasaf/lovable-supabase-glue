import { test, expect } from '@playwright/test';

test('ExpertFolio submit', async ({ page, request }) => {
  const base = process.env.PLAYWRIGHT_BASE_URL || process.env.PLAYWRIGHT_BASE_URL_FOLIO || 'http://localhost:3022';
  const headers = {
    'content-type': 'application/json',
    'x-test-auth': 'teacher',
    'origin': base,
    'referer': `${base}/x`
  } as any;

  // Submit assessment
  const res = await request.post(`${base}/api/ef/assessments`, {
    headers,
    data: { programId: '11111111-1111-1111-1111-111111111111', epaId: '22222222-2222-2222-2222-222222222222' }
  });
  expect(res.status()).toBe(201);
  const body = await res.json();
  expect(body.status).toBe('submitted');

  // Supervisor evaluation (TEST_MODE allows deterministic ok)
  const evalRes = await request.post(`${base}/api/ef/evaluations`, {
    headers: { ...headers, 'x-test-auth': 'teacher' },
    data: { assessmentId: body.id || 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', outcome: 'approved', comments: 'ok' }
  });
  expect(evalRes.status()).toBe(201);

  // Navigate to folio dashboard and verify totals are visible
  await page.goto(`${base}/folio/dashboard`);
  await expect(page.getByRole('heading', { name: /ExpertFolio/i })).toBeVisible();
  await expect(page.getByText(/Completed:/)).toBeVisible();
});


