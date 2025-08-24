describe('Quiz questions RLS/authorization negatives', () => {
  test('student cannot create quiz question', async () => {
    const route = await import('../../apps/web/src/app/api/quiz-questions/route');
    const req = new Request('http://localhost/api/quiz-questions', { method: 'POST', headers: { 'content-type': 'application/json', 'x-test-auth': 'student' } as any, body: JSON.stringify({ quiz_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', text: 'T' }) } as any);
    const res = await (route as any).POST(req as any);
    expect([401,403]).toContain(res.status);
  });
});
