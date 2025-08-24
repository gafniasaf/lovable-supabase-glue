describe('submissions RLS negatives (app-level guards)', () => {
  test('student cannot PATCH grade submission', async () => {
    const route = await import('../../apps/web/src/app/api/submissions/route');
    const res = await route.PATCH(new Request('http://localhost/api/submissions?id=unknown', { method: 'PATCH', headers: { 'x-test-auth': 'student', 'content-type': 'application/json' }, body: JSON.stringify({ score: 1 }) } as any) as any);
    expect([401,403]).toContain(res.status);
  });
});

describe('Submissions RLS/authorization negatives', () => {
  test('student cannot grade submission', async () => {
    const route = await import('../../apps/web/src/app/api/submissions/route');
    const req = new Request('http://localhost/api/submissions?id=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', { method: 'PATCH', headers: { 'content-type': 'application/json', 'x-test-auth': 'student' } as any, body: JSON.stringify({ score: 100, feedback: 'Nice' }) } as any);
    const res = await route.PATCH(req as any);
    expect([401,403]).toContain(res.status);
  });

  test('teacher cannot list submissions without assignment_id', async () => {
    const route = await import('../../apps/web/src/app/api/submissions/route');
    const req = new Request('http://localhost/api/submissions', { method: 'GET', headers: { 'x-test-auth': 'teacher' } as any } as any);
    const res = await route.GET(req as any);
    expect([400,401,403]).toContain(res.status);
  });
});
