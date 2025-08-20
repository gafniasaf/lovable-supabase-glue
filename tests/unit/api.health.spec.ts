import { GET as HealthGET } from '../../apps/web/src/app/api/health/route';

describe('api.health', () => {
  test('returns ok true and detects role via header', async () => {
    const res = await (HealthGET as any)(new Request('http://localhost/api/health', { headers: { 'x-test-auth': 'teacher' } }) as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.testRole).toBe('teacher');
  });

  test('returns ok true without auth', async () => {
    const res = await (HealthGET as any)(new Request('http://localhost/api/health') as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
  });
});

describe('Health API', () => {
  test('returns ok and reflects testMode and role from header/cookie', async () => {
    process.env.TEST_MODE = '1';
    const route = await import('../../apps/web/src/app/api/health/route');
    // no auth
    let res = await (route as any).GET(new Request('http://localhost/api/health') as any);
    let json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.testMode).toBe(true);
    // with role header
    res = await (route as any).GET(new Request('http://localhost/api/health', { headers: { 'x-test-auth': 'teacher' } }) as any);
    json = await res.json();
    expect(json.testRole).toBe('teacher');
  });
});


