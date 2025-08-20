// @ts-nocheck
import { checkRateLimit } from '../../apps/web/src/lib/rateLimit';

describe('lib rateLimit', () => {
  test('allows within limit then blocks with headers info semantics', () => {
    const key = 'test:bucket:1';
    const first = checkRateLimit(key, 2, 1000);
    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(1);
    const second = checkRateLimit(key, 2, 1000);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(0);
    const third = checkRateLimit(key, 2, 1000);
    expect(third.allowed).toBe(false);
    expect(third.remaining).toBe(0);
    expect(typeof third.resetAt).toBe('number');
  });
});


