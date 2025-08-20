describe('interactive_attempts RLS negatives', () => {
  test('student cannot access teacher outcomes', async () => {
    const route = await import('../../apps/web/src/app/api/runtime/teacher/outcomes/route');
    const res = await route.GET(new Request('http://localhost/api/runtime/teacher/outcomes', { headers: { 'x-test-auth': 'student' } } as any) as any);
    expect([401,403]).toContain(res.status);
  });
});


