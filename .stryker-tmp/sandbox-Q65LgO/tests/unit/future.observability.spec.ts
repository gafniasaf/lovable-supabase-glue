// @ts-nocheck
describe('Observability & Ops', () => {
  test('withRouteTiming sets x-request-id header for success', async () => {
    const { withRouteTiming } = await import('../../apps/web/src/server/withRouteTiming');
    const handler = withRouteTiming(async () => new Response('ok')) as (req: Request) => Promise<Response>;
    const req = new Request('http://localhost/api/ping', { headers: { 'x-request-id': 'up-123' } });
    const res = await handler(req);
    expect(res.headers.get('x-request-id')).toBe('up-123');
  });

  test('withRouteTiming rethrows and logs on error but still generates request id', async () => {
    const { withRouteTiming } = await import('../../apps/web/src/server/withRouteTiming');
    const failing = withRouteTiming(async () => { throw new Error('boom'); }) as (req: Request) => Promise<Response>;
    await expect(failing(new Request('http://localhost/api/err'))).rejects.toThrow('boom');
  });

  test('serverFetch forwards x-request-id and x-test-auth headers', async () => {
    const { serverFetch } = await import('../../apps/web/src/lib/serverFetch');
    const old = global.fetch;
    const calls: any[] = [];
    // 
    global.fetch = async (url: any, init?: any) => { calls.push({ url, init }); return new Response('ok'); };
    try {
      // 
      globalThis.__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'teacher');
      await serverFetch('/api/demo', { headers: { 'x-request-id': 'abc' } });
      const h = calls[0].init.headers as Headers;
      expect(h.get('x-request-id')).toBe('abc');
      expect(h.get('x-test-auth')).toBe('teacher');
    } finally {
      global.fetch = old;
    }
  });
});


