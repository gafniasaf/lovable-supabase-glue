import { loadClientEnv } from '@shared';

describe('env loader', () => {
  const env = { ...process.env };
  afterEach(() => {
    process.env = { ...env };
  });

  test('throws when missing required env', () => {
    delete (process.env as any).NEXT_PUBLIC_SUPABASE_URL;
    delete (process.env as any).NEXT_PUBLIC_SUPABASE_ANON_KEY;
    expect(() => loadClientEnv()).toThrow();
  });

  test('succeeds with valid env', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'abcdefghijklmnop';
    expect(() => loadClientEnv()).not.toThrow();
  });
});


