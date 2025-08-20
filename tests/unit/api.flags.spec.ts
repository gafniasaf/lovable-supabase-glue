describe('Feature flags API (test-mode)', () => {
  test('GET requires auth, returns list; PATCH validates key', async () => {
    process.env.TEST_MODE = '1';
    const route = await import('../../apps/web/src/app/api/flags/route');
    // unauthenticated GET
    let res = await route.GET(new Request('http://localhost/api/flags') as any);
    expect(res.status).toBe(401);
    // authenticated GET
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'admin');
    res = await route.GET(new Request('http://localhost/api/flags', { headers: { 'x-test-auth': 'admin' } }) as any);
    expect(res.status).toBe(200);
    // PATCH missing key -> 400
    const bad = await route.PATCH(new Request('http://localhost/api/flags', { method: 'PATCH', headers: { 'content-type': 'application/json', 'x-test-auth': 'admin' }, body: JSON.stringify({}) }) as any);
    expect(bad.status).toBe(400);
    // PATCH toggle a flag
    const ok = await route.PATCH(new Request('http://localhost/api/flags', { method: 'PATCH', headers: { 'content-type': 'application/json', 'x-test-auth': 'admin' }, body: JSON.stringify({ key: 'reports.enabled', value: true }) }) as any);
    expect(ok.status).toBe(200);
  });
});


