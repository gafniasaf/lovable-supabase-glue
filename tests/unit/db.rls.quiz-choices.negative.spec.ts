describe('Quiz choices RLS/authorization negatives', () => {
  test('student cannot create quiz choice', async () => {
    const route = await import('../../apps/web/src/app/api/quiz-choices/route');
    const req = new Request('http://localhost/api/quiz-choices', { method: 'POST', headers: { 'content-type': 'application/json', 'x-test-auth': 'student' } as any, body: JSON.stringify({ question_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', text: 'A', correct: false }) } as any);
    const res = await (route as any).POST(req as any);
    expect([401,403]).toContain(res.status);
  });
});
