import { jest } from '@jest/globals';

describe('supabaseBrowser client creation', () => {
  const originalEnv = process.env;
  beforeEach(() => { jest.resetModules(); process.env = { ...originalEnv }; });
  afterEach(() => { process.env = originalEnv; });

  test('uses env NEXT_PUBLIC_SUPABASE_URL/ANON when provided', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'sb_anon_dummy_key_123';
    // Spy on @supabase/supabase-js createClient
    const createClientSpy = jest.fn(() => ({ __type: 'supabase-js' } as any));
    jest.doMock('@supabase/supabase-js', () => ({ createClient: createClientSpy }));
    const { getSupabaseBrowser } = await import('../../apps/web/src/lib/supabaseBrowser');
    const client = getSupabaseBrowser();
    expect(createClientSpy).toHaveBeenCalledWith('https://example.supabase.co', 'sb_anon_dummy_key_123', expect.any(Object));
    expect((client as any).__type).toBe('supabase-js');
  });

  test('falls back to auth-helpers when envs absent', async () => {
    delete (process.env as any).NEXT_PUBLIC_SUPABASE_URL;
    delete (process.env as any).NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const cccSpy = jest.fn(() => ({ __type: 'auth-helpers' } as any));
    jest.doMock('@supabase/auth-helpers-nextjs', () => ({ createClientComponentClient: cccSpy }));
    const { getSupabaseBrowser } = await import('../../apps/web/src/lib/supabaseBrowser');
    const client = getSupabaseBrowser();
    expect(cccSpy).toHaveBeenCalled();
    expect((client as any).__type).toBe('auth-helpers');
  });
});
