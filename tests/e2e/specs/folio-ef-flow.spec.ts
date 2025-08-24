import { test, expect } from '@playwright/test';

test('ExpertFolio submit → review → notifications (smoke)', async ({ request, baseURL }) => {
  const base = (process.env.PLAYWRIGHT_BASE_URL_FOLIO || baseURL || 'http://localhost:3022').replace(/\/$/, '');
  const origin = base;
  // Submit assessment
  const submit = await request.post(`${base}/api/ef/assessments`, {
    data: { programId: '11111111-1111-1111-1111-111111111111', epaId: '22222222-2222-2222-2222-222222222222' },
    headers: { 'content-type': 'application/json', 'x-test-auth': 'teacher', origin, referer: origin + '/x' }
  });
  if (submit.status() === 404) test.skip(true, 'ExpertFolio feature disabled');
  expect([200,201]).toContain(submit.status());
  const a = await submit.json();
  expect(a.id).toBeTruthy();

  // Create evaluation
  const evalRes = await request.post(`${base}/api/ef/evaluations`, {
    data: { assessmentId: a.id, outcome: 'approved' },
    headers: { 'content-type': 'application/json', 'x-test-auth': 'teacher', origin, referer: origin + '/x' }
  });
  expect([200,201]).toContain(evalRes.status());

  // Verify notification exists
  const notif = await request.get(`${base}/api/notifications`, { headers: { 'x-test-auth': 'teacher' } });
  expect(notif.ok()).toBeTruthy();
  const list = await notif.json();
  expect(Array.isArray(list)).toBe(true);
  const hasEf = list.some((n: any) => typeof n?.type === 'string' && n.type.startsWith('ef.'));
  expect(hasEf).toBe(true);
});


