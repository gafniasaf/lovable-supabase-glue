describe('Registry RLS/authorization negatives', () => {
  test('non-admin cannot create external course', async () => {
    const route = await import('../../apps/web/src/app/api/registry/courses/route');
    const req = new Request('http://localhost/api/registry/courses', { method: 'POST', headers: { 'content-type': 'application/json', 'x-test-auth': 'teacher' } as any, body: JSON.stringify({ vendor_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', kind: 'v2', title: 'X', description: '', version: '1.0.0', status: 'draft', launch_url: 'https://ex/launch' }) } as any);
    const res = await (route as any).POST(req as any);
    expect([401,403,403]).toContain(res.status);
  });
});


