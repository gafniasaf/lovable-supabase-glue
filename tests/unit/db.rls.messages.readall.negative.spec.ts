describe('Messages read-all RLS negatives', () => {
  test('unauthenticated cannot mark read-all', async () => {
    const route = await import('../../apps/web/src/app/api/messages/threads/[id]/read-all/route');
    const res = await route.PATCH(new Request('http://localhost/api/messages/threads/t1/read-all', { method: 'PATCH' }) as any);
    expect(res.status).toBe(401);
  });
});


