const scheduleJob = jest.fn();
// Mock both the relative path the test inspects and the alias the scheduler imports
jest.mock('../../apps/web/src/lib/jobs', () => ({ scheduleJob }));
jest.mock('@/lib/jobs', () => ({ scheduleJob }));

describe('scheduler ensureJobsStarted flags', () => {
  const orig = { ...process.env } as any;
  const { scheduleJob } = require('../../apps/web/src/lib/jobs');

  beforeEach(() => {
    jest.resetModules();
    (scheduleJob as jest.Mock).mockClear();
    process.env = { ...orig } as any;
  });

  afterEach(() => { process.env = orig; });

  test('no flags → no jobs scheduled', async () => {
    const mod = await import('../../apps/web/src/server/scheduler');
    mod.ensureJobsStarted();
    expect((scheduleJob as jest.Mock).mock.calls.length).toBe(0);
  });

  test('DUE_SOON_JOB=1 schedules due-soon job', async () => {
    process.env.DUE_SOON_JOB = '1';
    const mod = await import('../../apps/web/src/server/scheduler');
    mod.ensureJobsStarted();
    const calls = (scheduleJob as jest.Mock).mock.calls.map((c: any[]) => c[0]);
    expect(calls).toContain('assignment_due_soon');
  });

  test('PROVIDER_HEALTH_REFRESH_JOB=1 schedules provider health refresh', async () => {
    process.env.PROVIDER_HEALTH_REFRESH_JOB = '1';
    const mod = await import('../../apps/web/src/server/scheduler');
    mod.ensureJobsStarted();
    const calls = (scheduleJob as jest.Mock).mock.calls.map((c: any[]) => c[0]);
    expect(calls).toContain('provider_health_refresh');
  });

  test('REFRESH_PROGRESS_SUMMARY_JOB=1 schedules progress mv refresh', async () => {
    process.env.REFRESH_PROGRESS_SUMMARY_JOB = '1';
    const mod = await import('../../apps/web/src/server/scheduler');
    mod.ensureJobsStarted();
    const calls = (scheduleJob as jest.Mock).mock.calls.map((c: any[]) => c[0]);
    expect(calls).toContain('refresh_progress_summary');
  });

  test('QUOTA_RECONCILE_JOB=1 schedules quota reconcile', async () => {
    process.env.QUOTA_RECONCILE_JOB = '1';
    const mod = await import('../../apps/web/src/server/scheduler');
    mod.ensureJobsStarted();
    const calls = (scheduleJob as jest.Mock).mock.calls.map((c: any[]) => c[0]);
    expect(calls).toContain('quota_reconcile');
  });

  test('BACKFILL_ATTACHMENT_SIZES_JOB=1 schedules backfill', async () => {
    process.env.BACKFILL_ATTACHMENT_SIZES_JOB = '1';
    const mod = await import('../../apps/web/src/server/scheduler');
    mod.ensureJobsStarted();
    const calls = (scheduleJob as jest.Mock).mock.calls.map((c: any[]) => c[0]);
    expect(calls).toContain('attachment_size_backfill');
  });
});


