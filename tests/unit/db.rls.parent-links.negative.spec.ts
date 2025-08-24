describe('Parent-links RLS/authorization negatives', () => {
  test('student cannot create parent link', async () => {
    const route = await import('../../apps/web/src/app/api/parent-links/route');
    const req = new Request('http://localhost/api/parent-links', { method: 'POST', headers: { 'content-type': 'application/json', 'x-test-auth': 'student' } as any, body: JSON.stringify({ parent_id: 'p', student_id: 's' }) } as any);
    const res = await route.POST(req as any);
    expect([401,403]).toContain(res.status);
  });

  test('parent cannot delete arbitrary link', async () => {
    const route = await import('../../apps/web/src/app/api/parent-links/route');
    const req = new Request('http://localhost/api/parent-links', { method: 'DELETE', headers: { 'content-type': 'application/json', 'x-test-auth': 'parent' } as any, body: JSON.stringify({ parent_id: 'p', student_id: 's' }) } as any);
    const res = await route.DELETE(req as any);
    expect([401,403,404]).toContain(res.status);
  });
});
