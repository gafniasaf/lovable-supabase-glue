import { GET as HealthGET } from '../../apps/web/src/app/api/health/route';

describe('api.health requiredEnvs snapshot', () => {
  const original = { ...process.env } as any;
  afterEach(() => { process.env = original; });

  test('includes Supabase keys and runtime keys when RUNTIME_API_V2=1', async () => {
    process.env = { ...original } as any;
    (process.env as any).NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    (process.env as any).NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key-1234567890';
    (process.env as any).RUNTIME_API_V2 = '1';
    (process.env as any).NEXT_RUNTIME_PUBLIC_KEY = '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtest\n-----END PUBLIC KEY-----';
    (process.env as any).NEXT_RUNTIME_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhk...\n-----END PRIVATE KEY-----';
    (process.env as any).NEXT_RUNTIME_KEY_ID = 'kid-1';
    const res = await (HealthGET as any)(new Request('http://localhost/api/health') as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.requiredEnvs).toBeTruthy();
    expect(json.requiredEnvs.NEXT_PUBLIC_SUPABASE_URL).toBe(true);
    expect(json.requiredEnvs.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe(true);
    expect(json.requiredEnvs.NEXT_RUNTIME_PUBLIC_KEY).toBe(true);
    expect(json.requiredEnvs.NEXT_RUNTIME_PRIVATE_KEY).toBe(true);
    expect(json.requiredEnvs.NEXT_RUNTIME_KEY_ID).toBe(true);
  });
});


