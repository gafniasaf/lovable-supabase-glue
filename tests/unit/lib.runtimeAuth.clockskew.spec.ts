describe('runtimeAuth clock skew tolerance', () => {
  test('accepts tokens within tolerance window (dev HS256 path mocked)', async () => {
    process.env.RUNTIME_CLOCK_SKEW_S = '120';
    process.env.NODE_ENV = 'development';
    process.env.NEXT_RUNTIME_PUBLIC_KEY = '';
    process.env.NEXT_RUNTIME_SECRET = 'dev-secret';
    jest.resetModules();
    jest.doMock('jose', () => ({
      jwtVerify: (_t: string, _k: any, _opts: any) => Promise.resolve({ payload: { aud: 'https://wcgyhwvugdnzhegwiiam.lovable.app', scopes: ['progress.write'] } })
    }));
    const { verifyRuntimeAuthorization } = await import('../../apps/web/src/lib/runtimeAuth');
    const req = new Request('http://localhost/api/runtime/progress', { headers: { authorization: 'Bearer X', origin: 'https://wcgyhwvugdnzhegwiiam.lovable.app' } as any } as any);
    const out: any = await (verifyRuntimeAuthorization as any)(req as any, ['progress.write']);
    expect(out.ok).toBe(true);
  });
});


