describe('runtime outcomes JWKS rotation', () => {
  test('refreshes JWKS on verify failure', async () => {
    const original = { ...process.env } as any;
    process.env = { ...original, RUNTIME_API_V2: '1' } as any;
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
    const supa = await import('../helpers/supabaseMock');
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue((supa as any).makeSupabaseMock({
      courses: () => supa.supabaseOk({ id: 'c1', provider_id: 'p1' }),
      course_providers: () => supa.supabaseOk({ jwks_url: 'https://example.com/jwks.json', domain: 'https://example.com' }),
      interactive_attempts: (p: any) => supa.supabaseOk({ id: 'ia1', course_id: 'c1', user_id: 'u1', score: p?.insert?.score ?? 1, max: p?.insert?.max ?? 1, passed: p?.insert?.passed ?? true })
    }));
    const req = new Request('http://localhost/api/runtime/outcomes', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer PROVIDERJWT' } as any, body: JSON.stringify({ courseId: 'c1', userId: 'u1', event: { type: 'attempt.completed', runtimeAttemptId: 'ra1', score: 1, max: 1, passed: true } }) } as any);
    const res = await route.POST(req as any);
    expect([200,201]).toContain(res.status);
    process.env = original as any;
  });
});


