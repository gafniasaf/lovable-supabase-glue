describe('Notifications preferences RLS negatives', () => {
  test('unauthenticated cannot update preferences', async () => {
    const route = await import('../../apps/web/src/app/api/notifications/preferences/route');
    const req = new Request('http://localhost/api/notifications/preferences', { method: 'PATCH', headers: { 'content-type': 'application/json' } as any, body: JSON.stringify({ 'message:new': false }) } as any);
    const res = await route.PATCH(req as any);
    expect(res.status).toBe(401);
  });
});


