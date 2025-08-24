describe('Notifications RLS/authorization negatives', () => {
  test('student cannot update another user\'s notification (shape-only test)', async () => {
    const route = await import('../../apps/web/src/app/api/notifications/route');
    const req = new Request('http://localhost/api/notifications', { method: 'PATCH', headers: { 'content-type': 'application/json', 'x-test-auth': 'student' } as any, body: JSON.stringify({ id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', read: true }) } as any);
    const res = await route.PATCH(req as any);
    expect([401,403,404,400]).toContain(res.status);
  });
});


