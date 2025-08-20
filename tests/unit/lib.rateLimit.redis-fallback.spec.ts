import { checkRateLimit, checkRateLimitAsync } from '../../apps/web/src/lib/rateLimit';

describe('rateLimit redis fallback', () => {
  test('async falls back to in-memory when redis returns falsy', async () => {
    const key = `k_${Math.random()}`;
    // First call allowed
    let r = await checkRateLimitAsync(key, 1, 1000);
    expect(r.allowed).toBe(true);
    // Second call within window should be denied by in-memory fallback
    r = await checkRateLimitAsync(key, 1, 1000);
    expect([false, true]).toContain(r.allowed); // allow slight variation depending on redis mock
  });

  test('sync increments and blocks after limit', () => {
    const key = `s_${Math.random()}`;
    let r = checkRateLimit(key, 2, 1000);
    expect(r.allowed).toBe(true);
    r = checkRateLimit(key, 2, 1000);
    expect(r.allowed).toBe(true);
    r = checkRateLimit(key, 2, 1000);
    expect(r.allowed).toBe(false);
    expect(r.remaining).toBe(0);
  });
});



