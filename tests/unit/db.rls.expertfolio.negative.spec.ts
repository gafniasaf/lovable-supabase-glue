describe('ExpertFolio RLS/tenancy negatives (app-level guards expected for now)', () => {
  test('EF endpoints are 401 without user', async () => {
    const { POST: PostAssessment } = await import('../../apps/web/src/app/api/ef/assessments/route');
    const req = new Request('http://localhost/api/ef/assessments', { method: 'POST', headers: { 'content-type': 'application/json' } as any, body: JSON.stringify({ programId: 'p', epaId: 'e' }) } as any);
    const res = await (PostAssessment as any)(req as any);
    expect(res.status).toBe(401);
  });
});


