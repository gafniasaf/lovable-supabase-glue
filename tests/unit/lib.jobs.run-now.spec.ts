describe('jobs runScheduledJobNow helper', () => {
  test('invokes job function and increments counters', async () => {
    const jobsMod = jest.requireActual('../../apps/web/src/lib/jobs') as typeof import('../../apps/web/src/lib/jobs');
    const metrics = await import('../../apps/web/src/lib/metrics');
    const before = (metrics as any).getCounters();
    jobsMod.scheduleJob('test_job', 9999999, async () => {});
    await jobsMod.runScheduledJobNow('test_job');
    const after = (metrics as any).getCounters();
    expect(after['job.test_job.runs']).toBeGreaterThan((before['job.test_job.runs'] ?? 0));
  });
});


