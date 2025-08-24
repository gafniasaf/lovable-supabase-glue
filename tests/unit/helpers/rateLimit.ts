type MockRL = { allowed: boolean; remaining: number; resetAt: number };

export function mockRateLimit(rl: Partial<MockRL> = {}) {
  const now = Date.now();
  const mock: MockRL = {
    allowed: false,
    remaining: 0,
    resetAt: now + 30_000,
    ...rl,
  } as MockRL;
  const factory = () => ({ checkRateLimit: () => mock });
  // Register alias path; many specs import via alias
  jest.mock('@/lib/rateLimit', factory as any, { virtual: true } as any);
  return mock;
}

export function expectRateLimited(res: Response) {
  expect(res.status).toBe(429);
  expect(res.headers.get('retry-after')).toBeTruthy();
  expect(res.headers.get('x-rate-limit-reset')).toBeTruthy();
  expect(res.headers.get('x-rate-limit-remaining')).toBeDefined();
}


