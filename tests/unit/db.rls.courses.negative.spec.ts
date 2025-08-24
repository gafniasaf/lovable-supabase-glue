describe('Courses RLS/authorization negatives', () => {
  test('student cannot create course', async () => {
    const route = await import('../../apps/web/src/app/api/courses/route');
    const req = new Request('http://localhost/api/courses', { method: 'POST', headers: { 'content-type': 'application/json', 'x-test-auth': 'student' } as any, body: JSON.stringify({ title: 'X', description: '' }) } as any);
    const res = await (route as any).POST(req as any);
    expect([401,403]).toContain(res.status);
  });

  test('student cannot delete course', async () => {
    const route = await import('../../apps/web/src/app/api/courses/[id]/route');
    const req = new Request('http://localhost/api/courses/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', { method: 'DELETE', headers: { 'x-test-auth': 'student' } as any } as any);
    const res = await (route as any).DELETE(req as any, { params: { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' } } as any);
    expect([401,403]).toContain(res.status);
  });
});


