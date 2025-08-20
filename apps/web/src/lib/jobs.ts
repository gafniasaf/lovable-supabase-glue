/**
 * Minimal job scheduling stubs. In production, move to a queue like BullMQ.
 */
type Job = () => Promise<void>;
const scheduled: Array<{ name: string; intervalMs: number; fn: Job; handle?: any }> = [];

export function scheduleJob(name: string, intervalMs: number, fn: Job) {
  // In test environment, register the job without creating a real interval
  if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID) {
    scheduled.push({ name, intervalMs, fn });
    return;
  }
  const handle = setInterval(async () => {
    const start = Date.now();
    try {
      await fn();
    } catch {
      try { (await import('./metrics')).incrCounter(`job.${name}.errors`); } catch {}
    } finally {
      try {
        (await import('./metrics')).incrCounter(`job.${name}.runs`);
        (await import('./metrics')).incrCounter(`job.${name}.ms`, Date.now() - start);
      } catch {}
    }
  }, intervalMs);
  // Do not keep the Node event loop alive because of background intervals during tests
  try { (handle as any)?.unref?.(); } catch {}
  scheduled.push({ name, intervalMs, fn, handle });
}

export function stopAllJobs() {
  for (const j of scheduled) if (j.handle) clearInterval(j.handle);
  // Reset scheduled list to avoid leaking references across tests
  (scheduled as any).length = 0;
}


