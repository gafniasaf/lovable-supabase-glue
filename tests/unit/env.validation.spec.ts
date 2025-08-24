import { loadServerEnv } from '../../packages/shared/src/env';

describe('environment validation', () => {
  const original = { ...process.env } as any;
  afterEach(() => { process.env = original; });

  test('prod with RUNTIME_API_V2=1 requires RS256 keys', () => {
    process.env = { ...original, NODE_ENV: 'production', RUNTIME_API_V2: '1' } as any;
    expect(() => loadServerEnv()).toThrow(/Runtime v2 requires/);
  });

  test('prod with TEST_MODE=1 throws unless explicitly allowed', () => {
    process.env = { ...original, NODE_ENV: 'production', TEST_MODE: '1' } as any;
    expect(() => loadServerEnv()).toThrow(/TEST_MODE must not be enabled/);
  });

  test('invalid numeric values throw', () => {
    process.env = { ...original, RUNTIME_EVENTS_LIMIT: 'abc' } as any;
    expect(() => loadServerEnv()).toThrow();
  });

  test('reports limits validate numerics', () => {
    process.env = {
      ...original,
      REPORTS_ACTIVITY_LIMIT: 'x',
      REPORTS_ACTIVITY_WINDOW_MS: '-1',
      REPORTS_RETENTION_LIMIT: '100',
      REPORTS_RETENTION_WINDOW_MS: '60000'
    } as any;
    expect(() => loadServerEnv()).toThrow();
    process.env = { ...original, REPORTS_ACTIVITY_LIMIT: '200', REPORTS_ACTIVITY_WINDOW_MS: '60000' } as any;
    expect(() => loadServerEnv()).not.toThrow();
  });
});


