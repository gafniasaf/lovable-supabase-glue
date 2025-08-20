import { middleware } from '../../apps/web/middleware';

function req(url: string, headers?: Record<string, string>) {
  return new Request(url, { headers: headers as any } as any);
}

describe('middleware headers behavior', () => {
  const originalEnv = { ...process.env };
  beforeEach(() => { jest.resetModules(); process.env = { ...originalEnv }; });
  afterEach(() => { process.env = originalEnv; });

  test('adds x-request-id if missing via a guard response path', async () => {
    // Force a guard path that returns NextResponse.json instead of NextResponse.next
    process.env.NODE_ENV = 'production' as any;
    process.env.TEST_MODE = '1';
    const res: any = await (middleware as any)(req('http://localhost/api/health'));
    expect(res).toBeTruthy();
    expect(res.headers.get('x-request-id')).toBeTruthy();
  });

  test('echoes upstream x-request-id on forbidden x-test-auth path', async () => {
    delete (process.env as any).TEST_MODE; // not in test mode => x-test-auth is forbidden
    const res: any = await (middleware as any)(req('http://localhost/api/health', { 'x-test-auth': 'teacher', 'x-request-id': 'rq-mid-123' }));
    expect(res).toBeTruthy();
    expect(res.headers.get('x-request-id')).toBe('rq-mid-123');
  });

  test('in production: RUNTIME_API_V2=1 without RS256 keys yields 500', async () => {
    process.env.NODE_ENV = 'production' as any;
    (process.env as any).RUNTIME_API_V2 = '1';
    delete (process.env as any).NEXT_RUNTIME_PUBLIC_KEY;
    delete (process.env as any).NEXT_RUNTIME_PRIVATE_KEY;
    delete (process.env as any).NEXT_RUNTIME_KEY_ID;
    // Provide required Supabase envs so we reach the RS256 guard
    (process.env as any).NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    (process.env as any).NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-1234567890';
    const res: any = await (middleware as any)(req('http://localhost/api/health', { 'x-request-id': 'rq-mid-2000' }));
    expect(res.status).toBe(500);
    expect(res.headers.get('x-request-id')).toBe('rq-mid-2000');
  });

  test('in production: missing NEXT_PUBLIC_SUPABASE_* yields 500 with request-id', async () => {
    process.env.NODE_ENV = 'production' as any;
    delete (process.env as any).NEXT_PUBLIC_SUPABASE_URL;
    delete (process.env as any).NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const res: any = await (middleware as any)(req('http://localhost/api/health', { 'x-request-id': 'rq-mid-999' }));
    expect(res.status).toBe(500);
    expect(res.headers.get('x-request-id')).toBe('rq-mid-999');
  });

  test('in production: http Supabase URL yields 500 with request-id', async () => {
    process.env.NODE_ENV = 'production' as any;
    (process.env as any).NEXT_PUBLIC_SUPABASE_URL = 'http://insecure.example';
    (process.env as any).NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-1234567890';
    const res: any = await (middleware as any)(req('http://localhost/api/health', { 'x-request-id': 'rq-mid-1000' }));
    expect(res.status).toBe(500);
    expect(res.headers.get('x-request-id')).toBe('rq-mid-1000');
  });
});


