describe('Files finalize RLS/authorization negatives', () => {
  test('unauthenticated cannot finalize upload', async () => {
    const route = await import('../../apps/web/src/app/api/files/finalize/route');
    const req = new Request('http://localhost/api/files/finalize', { method: 'POST', headers: { 'content-type': 'application/json' } as any, body: JSON.stringify({ key: 'k', size_bytes: 1 }) } as any);
    const res = await (route as any).POST(req as any);
    expect(res.status).toBe(401);
  });
});


