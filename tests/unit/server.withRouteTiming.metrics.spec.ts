jest.mock('../../apps/web/src/lib/metrics', () => {
  const calls: any = { timings: [] as any[], errors: [] as any[] };
  return {
    recordTiming: (path: string, ms: number) => calls.timings.push({ path, ms }),
    recordError: (path: string) => calls.errors.push({ path }),
    incrCounter: () => {},
    __TEST_CALLS__: calls,
  } as any;
});

describe('withRouteTiming metrics', () => {
  test('records timing on success and error', async () => {
    const { withRouteTiming } = await import('../../apps/web/src/server/withRouteTiming');
    const ok = withRouteTiming(async () => new Response('ok')) as (req: Request) => Promise<Response>;
    const bad = withRouteTiming(async () => { throw new Error('boom'); }) as (req: Request) => Promise<Response>;
    const reqOk = new Request('http://localhost/api/a');
    const reqBad = new Request('http://localhost/api/b');
    await ok(reqOk);
    await expect(bad(reqBad)).rejects.toThrow('boom');
    const mod: any = await import('../../apps/web/src/lib/metrics');
    const paths = (mod.__TEST_CALLS__.timings || []).map((t: any) => t.path);
    expect(paths).toEqual(expect.arrayContaining(['/api/a', '/api/b']));
    expect((mod.__TEST_CALLS__.errors || []).some((e: any) => e.path === '/api/b')).toBe(true);
  });
});


