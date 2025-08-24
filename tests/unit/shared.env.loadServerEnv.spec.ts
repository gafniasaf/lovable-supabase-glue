import { loadServerEnv } from '../../packages/shared/src/env';

describe('loadServerEnv', () => {
  const orig = { ...process.env } as any;
  afterEach(() => { process.env = orig; });

  test('in production with RUNTIME_API_V2=1, missing RS256 keys throws', () => {
    process.env = { ...orig, NODE_ENV: 'production', RUNTIME_API_V2: '1', NEXT_RUNTIME_PUBLIC_KEY: '', NEXT_RUNTIME_PRIVATE_KEY: '', NEXT_RUNTIME_KEY_ID: '' } as any;
    expect(() => loadServerEnv()).toThrow(/Runtime v2 requires/i);
  });

  test('numeric env validation throws on invalid number', () => {
    process.env = { ...orig, RUNTIME_EVENTS_LIMIT: 'abc' } as any;
    expect(() => loadServerEnv()).toThrow(/RUNTIME_EVENTS_LIMIT/i);
  });

  test('RUNTIME_CORS_ALLOW invalid origin throws', () => {
    process.env = { ...orig, RUNTIME_CORS_ALLOW: 'not-a-url' } as any;
    expect(() => loadServerEnv()).toThrow(/RUNTIME_CORS_ALLOW/i);
  });

  test('defaults are provided in test mode', () => {
    process.env = { ...orig, TEST_MODE: '1' } as any;
    const env = loadServerEnv();
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBeTruthy();
    expect(env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeTruthy();
  });
});
