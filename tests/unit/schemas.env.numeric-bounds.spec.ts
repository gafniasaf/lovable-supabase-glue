import { loadServerEnv } from '@education/shared';

describe('env numeric bounds validation', () => {
  const original = { ...process.env };
  beforeEach(() => { process.env = { ...original }; (process.env as any).TEST_MODE = '1'; });
  afterEach(() => { process.env = original; });

  test('negative GLOBAL_MUTATION_RATE_LIMIT throws', () => {
    process.env.GLOBAL_MUTATION_RATE_LIMIT = '-1';
    expect(() => loadServerEnv()).toThrow(/GLOBAL_MUTATION_RATE_LIMIT/);
  });

  test('non-numeric WINDOW throws', () => {
    process.env.GLOBAL_MUTATION_RATE_WINDOW_MS = 'abc';
    expect(() => loadServerEnv()).toThrow(/GLOBAL_MUTATION_RATE_WINDOW_MS/);
  });
});


