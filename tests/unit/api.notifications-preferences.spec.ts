describe('Notification preferences API', () => {
  test('GET returns defaults in test-mode and PATCH persists overrides', async () => {
    process.env.TEST_MODE = '1';
    const route = await import('../../apps/web/src/app/api/notifications/preferences/route');
    // unauthenticated -> 401
    let res = await route.GET(new Request('http://localhost/api/notifications/preferences') as any);
    expect(res.status).toBe(401);
    // authenticated -> defaults
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'teacher');
    res = await route.GET(new Request('http://localhost/api/notifications/preferences', { headers: { 'x-test-auth': 'teacher' } }) as any);
    expect(res.status).toBe(200);
    const prefs = await res.json();
    expect(prefs['message:new']).toBe(true);
    // PATCH override
    const patch = await route.PATCH(new Request('http://localhost/api/notifications/preferences', { method: 'PATCH', headers: { 'content-type': 'application/json', 'x-test-auth': 'teacher' }, body: JSON.stringify({ 'message:new': false }) }) as any);
    expect(patch.status).toBe(200);
    const updated = await patch.json();
    expect(updated['message:new']).toBe(false);
  });

  test('PUT merges prefs; unknown keys ignored/tolerated', async () => {
    process.env.TEST_MODE = '1';
    const route = await import('../../apps/web/src/app/api/notifications/preferences/route');
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'student');
    const res = await route.PATCH(new Request('http://localhost/api/notifications/preferences', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', 'x-test-auth': 'student' },
      body: JSON.stringify({ 'assignment:new': false, extra_key: true })
    }) as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body['assignment:new']).toBe(false);
    expect(body['extra_key']).toBe(true);
  });
});


