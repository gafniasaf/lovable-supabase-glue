describe('runtime outcomes JWKS rotation', () => {
  test('refreshes JWKS on verify failure', async () => {
    jest.resetModules();
    // Mock jwksCache to simulate first verify failure then success after cache delete
    jest.doMock('../../apps/web/src/lib/jwksCache', () => {
      let first = true;
      return {
        verifyJwtWithJwks: async (_token: string, _url: string) => {
          if (first) { first = false; throw new Error('bad kid'); }
          return { courseId: 'c1', userId: 'u1' } as any;
        }
      };
    });
    const route = await import('../../apps/web/src/app/api/runtime/outcomes/route');
    // Simulate provider with jwks_url in DB by mocking supabase call chain
    const supa = await import('../../apps/web/src/lib/supabaseServer');
    (supa as any).getRouteHandlerSupabase = () => (supa as any).makeSupabaseMock({
      course_providers: () => ({ data: [{ jwks_url: 'https://example.com/jwks.json' }], error: null }),
      course_events: () => ({ data: null, error: null })
    });
    const req = new Request('http://localhost/api/runtime/outcomes', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer PROVIDERJWT' } as any, body: JSON.stringify({ courseId: 'c1', userId: 'u1', event: { type: 'attempt.completed', runtimeAttemptId: 'ra1', score: 1, max: 1, passed: true } }) } as any);
    const res = await route.POST(req as any);
    expect([200,201]).toContain(res.status);
  });
});


