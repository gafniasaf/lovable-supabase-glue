describe('Messages RLS/authorization negatives', () => {
  test('unauthenticated cannot mark thread read-all', async () => {
    const route = await import('../../apps/web/src/app/api/messages/threads/[id]/read-all/route');
    const req = new Request('http://localhost/api/messages/threads/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/read-all', { method: 'PATCH' } as any);
    const res = await route.PATCH(req as any, { params: { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' } } as any);
    expect([401,403]).toContain(res.status);
  });
});


