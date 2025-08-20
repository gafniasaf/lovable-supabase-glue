describe('Runtime endpoints set Vary: Origin', () => {
  const ORIGIN = 'https://wcgyhwvugdnzhegwiiam.lovable.app';
  test('progress preflight', async () => {
    const route = await import('../../apps/web/src/app/api/runtime/progress/route');
    const res = await route.OPTIONS(new Request('http://localhost/api/runtime/progress', { method: 'OPTIONS', headers: { Origin: ORIGIN } as any }) as any);
    expect(res.headers.get('vary')).toBe('Origin');
  });
});


