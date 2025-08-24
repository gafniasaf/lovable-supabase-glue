describe('Providers RLS/authorization negatives', () => {
  test('non-admin cannot create provider', async () => {
    const route = await import('../../apps/web/src/app/api/providers/route');
    const req = new Request('http://localhost/api/providers', { method: 'POST', headers: { 'content-type': 'application/json', 'x-test-auth': 'teacher' } as any, body: JSON.stringify({ name: 'P', jwks_url: 'https://ex/jwks.json', domain: 'https://ex' }) } as any);
    const res = await (route as any).POST(req as any);
    expect([401,403]).toContain(res.status);
  });
});


