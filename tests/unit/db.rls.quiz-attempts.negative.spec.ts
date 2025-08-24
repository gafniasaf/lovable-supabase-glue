describe('Quiz attempts RLS/authorization negatives', () => {
  test('teacher cannot start a quiz attempt', async () => {
    const route = await import('../../apps/web/src/app/api/quiz-attempts/route');
    const req = new Request('http://localhost/api/quiz-attempts', { method: 'POST', headers: { 'content-type': 'application/json', 'x-test-auth': 'teacher' } as any, body: JSON.stringify({ quiz_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' }) } as any);
    const res = await route.POST(req as any);
    expect([401,403]).toContain(res.status);
  });

  test('student cannot list attempts without quiz_id', async () => {
    const route = await import('../../apps/web/src/app/api/quiz-attempts/route');
    const req = new Request('http://localhost/api/quiz-attempts', { method: 'GET', headers: { 'x-test-auth': 'student' } as any } as any);
    const res = await route.GET(req as any);
    expect([400,401,403]).toContain(res.status);
  });
});
