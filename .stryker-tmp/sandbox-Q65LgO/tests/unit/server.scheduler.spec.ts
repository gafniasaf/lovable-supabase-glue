// @ts-nocheck
describe('scheduler ensureJobsStarted', () => {
  const original = process.env;
  beforeEach(() => { jest.resetModules(); process.env = { ...original }; });
  afterEach(() => { process.env = original; });

  test('does not schedule when DUE_SOON_JOB != 1', async () => {
    const mod = await import('../../apps/web/src/server/scheduler');
    const spy = jest.spyOn(await import('../../apps/web/src/lib/jobs'), 'scheduleJob');
    delete process.env.DUE_SOON_JOB;
    mod.ensureJobsStarted();
    expect(spy).not.toHaveBeenCalled();
  });

  test('schedules when env set', async () => {
    const mod = await import('../../apps/web/src/server/scheduler');
    const spy = jest.spyOn(await import('../../apps/web/src/lib/jobs'), 'scheduleJob');
    process.env.DUE_SOON_JOB = '1';
    process.env.DUE_SOON_INTERVAL_MS = '10';
    mod.ensureJobsStarted();
    expect(spy).toHaveBeenCalled();
  });
});


