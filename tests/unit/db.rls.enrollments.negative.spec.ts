describe('Enrollments RLS/authorization negatives', () => {
  test('teacher cannot enroll as student', async () => {
    const route = await import('../../apps/web/src/app/api/enrollments/route');
    const req = new Request('http://localhost/api/enrollments', { method: 'POST', headers: { 'content-type': 'application/json', 'x-test-auth': 'teacher' } as any, body: JSON.stringify({ course_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' }) } as any);
    const res = await (route as any).POST(req as any);
    expect([401,403]).toContain(res.status);
  });
});
