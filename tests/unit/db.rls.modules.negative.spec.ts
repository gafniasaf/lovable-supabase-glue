describe('Modules RLS/authorization negatives', () => {
  test('student cannot create module', async () => {
    const route = await import('../../apps/web/src/app/api/modules/route');
    const req = new Request('http://localhost/api/modules', { method: 'POST', headers: { 'content-type': 'application/json', 'x-test-auth': 'student' } as any, body: JSON.stringify({ course_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', title: 'M' }) } as any);
    const res = await (route as any).POST(req as any);
    expect([401,403]).toContain(res.status);
  });
});
