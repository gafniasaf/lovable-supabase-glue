describe('Reports RLS/authorization negatives', () => {
  test('unauthenticated cannot access activity report', async () => {
    const route = await import('../../apps/web/src/app/api/reports/activity/route');
    const req = new Request('http://localhost/api/reports/activity', { method: 'GET' } as any);
    const res = await (route as any).GET(req as any);
    expect(res.status).toBe(401);
  });
});


