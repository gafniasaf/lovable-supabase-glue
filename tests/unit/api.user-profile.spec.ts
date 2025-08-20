describe('User profile API', () => {
  test('GET returns test profile in test-mode; PUT validates bad payload', async () => {
    process.env.TEST_MODE = '1';
    const route = await import('../../apps/web/src/app/api/user/profile/route');
    // unauthenticated
    let res = await route.GET(new Request('http://localhost/api/user/profile') as any);
    expect(res.status).toBe(401);
    // authenticated GET
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'teacher');
    res = await route.GET(new Request('http://localhost/api/user/profile', { headers: { 'x-test-auth': 'teacher' } }) as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBeTruthy();
    // PUT bad payload -> 400
    const bad = await route.PUT(new Request('http://localhost/api/user/profile', { method: 'PUT', headers: { 'content-type': 'application/json', 'x-test-auth': 'teacher' }, body: JSON.stringify({ display_name: 123 }) }) as any);
    expect(bad.status).toBe(400);
  });
});


