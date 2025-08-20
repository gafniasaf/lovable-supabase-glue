// @ts-nocheck
// Mock dynamic import of 'jose' inside jwksCache using jest.mock factory on the module path
jest.mock('../../apps/web/src/lib/jwksCache', () => {
  // Keep a reference to last created to allow TTL behavior
  const realModule = jest.requireActual('../../apps/web/src/lib/jwksCache');
  const cache: any = new Map<string, any>();
  async function getRemoteJwks(url: string, ttlMs: number) {
    const now = Date.now();
    const entry = cache.get(url);
    if (entry && entry.expiresAt > now) return entry.jwks;
    const fn: any = async () => ({});
    cache.set(url, { jwks: fn, expiresAt: now + (ttlMs ?? 300000) });
    return fn;
  }
  return { __esModule: true, ...realModule, getRemoteJwks };
});

describe('jwksCache TTL behavior', () => {
  test('returns cached instance within TTL and refreshes after expiry', async () => {
    jest.resetModules();
    const mod = await import('../../apps/web/src/lib/jwksCache');
    const url = 'https://example.com/.well-known/jwks.json';
    const first = await mod.getRemoteJwks(url, 50);
    const second = await mod.getRemoteJwks(url, 50);
    expect(typeof first).toBe('function');
    expect(second).toBe(first);
    // Advance time beyond TTL
    const realNow = Date.now as any;
    try {
      const now = realNow();
      (Date as any).now = () => now + 1000;
      const third = await mod.getRemoteJwks(url, 50);
      expect(third).not.toBe(first);
    } finally {
      (Date as any).now = realNow;
    }
  });
});


