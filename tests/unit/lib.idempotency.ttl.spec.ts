import { wasSeenAndRecord, sweepExpired } from '../../apps/web/src/lib/idempotency';

describe('idempotency TTL behavior (in-memory fallback)', () => {
  test('returns false first time, true within TTL, false after expiration', () => {
    const key = `k_${Math.random()}`;
    expect(wasSeenAndRecord(key, 50)).toBe(false);
    expect(wasSeenAndRecord(key, 50)).toBe(true);
    // Advance time by > TTL
    const realNow = Date.now;
    // @ts-ignore
    Date.now = () => realNow() + 60_000;
    try {
      sweepExpired();
      expect(wasSeenAndRecord(key, 50)).toBe(false);
    } finally {
      Date.now = realNow;
    }
  });
});


