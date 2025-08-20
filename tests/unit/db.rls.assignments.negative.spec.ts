describe('Assignments RLS/authorization negatives', () => {
  test('student cannot create assignment', async () => {
    const route = await import('../../apps/web/src/app/api/assignments/route');
    const req = new Request('http://localhost/api/assignments', { method: 'POST', headers: { 'content-type': 'application/json', 'x-test-auth': 'student' } as any, body: JSON.stringify({ course_id: 'c1', title: 'X', points: 10, due_at: null }) } as any);
    const res = await route.POST(req as any);
    expect([401,403]).toContain(res.status);
  });

  test('student cannot update assignment', async () => {
    const route = await import('../../apps/web/src/app/api/assignments/route');
    const req = new Request('http://localhost/api/assignments?id=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', { method: 'PATCH', headers: { 'content-type': 'application/json', 'x-test-auth': 'student' } as any, body: JSON.stringify({ title: 'New' }) } as any);
    const res = await route.PATCH(req as any);
    expect([401,403]).toContain(res.status);
  });

  test('student cannot delete assignment', async () => {
    const route = await import('../../apps/web/src/app/api/assignments/route');
    const req = new Request('http://localhost/api/assignments?id=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', { method: 'DELETE', headers: { 'x-test-auth': 'student' } } as any);
    const res = await route.DELETE(req as any);
    expect([401,403]).toContain(res.status);
  });
});


