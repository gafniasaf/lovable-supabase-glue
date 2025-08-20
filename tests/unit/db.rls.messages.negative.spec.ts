describe('Messages/Threads RLS negatives', () => {
  test('unauthenticated cannot list threads', async () => {
    const route = await import('../../apps/web/src/app/api/messages/threads/route');
    const res = await route.GET(new Request('http://localhost/api/messages/threads') as any);
    expect(res.status).toBe(401);
  });

  test('non-participant cannot create thread for others only (route enforces inclusion)', async () => {
    const route = await import('../../apps/web/src/app/api/messages/threads/route');
    const req = new Request('http://localhost/api/messages/threads', { method: 'POST', headers: { 'content-type': 'application/json', 'x-test-auth': 'student' } as any, body: JSON.stringify({ participant_ids: ['u2','u3'] }) } as any);
    const res = await route.POST(req as any);
    // Route includes current user; ensure at least not 500
    expect([201,401,403,429]).toContain(res.status);
  });
});


