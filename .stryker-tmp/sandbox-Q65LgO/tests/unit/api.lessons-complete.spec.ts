// @ts-nocheck
describe('Lessons complete API', () => {
  test('enforces student role and returns latest completion marker', async () => {
    process.env.TEST_MODE = '1';
    const route = await import('../../apps/web/src/app/api/lessons/complete/route');
    // unauthenticated -> 401
    let res = await route.POST(new Request('http://localhost/api/lessons/complete', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ lessonId: '00000000-0000-0000-0000-000000000001' }) }) as any);
    expect(res.status).toBe(401);
    // non-student -> 403
    // 
    globalThis.__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'teacher');
    res = await route.POST(new Request('http://localhost/api/lessons/complete', { method: 'POST', headers: { 'content-type': 'application/json', 'x-test-auth': 'teacher' }, body: JSON.stringify({ lessonId: '00000000-0000-0000-0000-000000000001' }) }) as any);
    expect(res.status).toBe(403);
    // student -> ok
    // 
    globalThis.__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'student');
    res = await route.POST(new Request('http://localhost/api/lessons/complete', { method: 'POST', headers: { 'content-type': 'application/json', 'x-test-auth': 'student' }, body: JSON.stringify({ lessonId: '00000000-0000-0000-0000-000000000001' }) }) as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.latest.lessonId).toBe('00000000-0000-0000-0000-000000000001');
  });
});


