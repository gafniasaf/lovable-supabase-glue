import { loadServerEnv } from '@education/shared';

describe('server env runtime keys (production fail-fast)', () => {
  const originalEnv = { ...process.env };
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });
  afterEach(() => {
    process.env = originalEnv;
  });

  test('throws in production when RUNTIME_API_V2=1 and RS256 keys missing', () => {
    process.env.NODE_ENV = 'production' as any;
    process.env.RUNTIME_API_V2 = '1';
    delete (process.env as any).NEXT_RUNTIME_PUBLIC_KEY;
    delete (process.env as any).NEXT_RUNTIME_PRIVATE_KEY;
    delete (process.env as any).NEXT_RUNTIME_KEY_ID;
    // Provide required public envs so loader can proceed to the RS256 check
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-1234567890';
    expect(() => loadServerEnv()).toThrow(/Runtime v2 requires/);
  });

  test('succeeds in production when RS256 keys are present', () => {
    process.env.NODE_ENV = 'production' as any;
    process.env.RUNTIME_API_V2 = '1';
    process.env.NEXT_RUNTIME_PUBLIC_KEY = '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtestkey\n-----END PUBLIC KEY-----';
    process.env.NEXT_RUNTIME_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCAtestkey\n-----END PRIVATE KEY-----';
    process.env.NEXT_RUNTIME_KEY_ID = 'kid-1';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-1234567890';
    // Other required prod envs
    process.env.METRICS_TOKEN = 'secret';
    // Allow TEST_MODE in production for tests via explicit public flag
    process.env.NEXT_PUBLIC_TEST_MODE = '1';
    expect(() => loadServerEnv()).not.toThrow();
  });
});


