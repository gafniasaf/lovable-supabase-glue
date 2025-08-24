describe('Lessons RLS/authorization negatives', () => {
  test('student cannot create lesson', async () => {
    const route = await import('../../apps/web/src/app/api/lessons/route');
    const req = new Request('http://localhost/api/lessons', { method: 'POST', headers: { 'content-type': 'application/json', 'x-test-auth': 'student' } as any, body: JSON.stringify({ course_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', title: 'L', content: '' }) } as any);
    const res = await (route as any).POST(req as any);
    expect([401,403]).toContain(res.status);
  });
});
