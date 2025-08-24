describe('Announcements RLS/authorization negatives', () => {
  test('student cannot create announcement', async () => {
    const route = await import('../../apps/web/src/app/api/announcements/route');
    const req = new Request('http://localhost/api/announcements', { method: 'POST', headers: { 'content-type': 'application/json', 'x-test-auth': 'student' } as any, body: JSON.stringify({ course_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', title: 'A', body: 'B' }) } as any);
    const res = await (route as any).POST(req as any);
    expect([401,403]).toContain(res.status);
  });

  test('student cannot delete announcement', async () => {
    const route = await import('../../apps/web/src/app/api/announcements/route');
    const req = new Request('http://localhost/api/announcements?id=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', { method: 'DELETE', headers: { 'x-test-auth': 'student' } as any } as any);
    const res = await (route as any).DELETE(req as any);
    expect([401,403]).toContain(res.status);
  });
});


