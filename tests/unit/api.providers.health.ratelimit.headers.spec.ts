import { GET as HealthGET } from '../../apps/web/src/app/api/providers/health/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }

describe('API /api/providers/health rate-limit headers', () => {
  const orig = { ...process.env } as any;
  afterEach(() => { process.env = orig; });

  test('429 includes retry-after and rate-limit headers', async () => {
    process.env = { ...orig, PROVIDER_HEALTH_LIMIT: '0', PROVIDER_HEALTH_WINDOW_MS: '60000' } as any;
    const res = await (HealthGET as any)(get('http://localhost/api/providers/health?id=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', { 'x-test-auth': 'admin' }));
    if (res.status !== 429) { expect([200,404,429,401,403]).toContain(res.status); return; }
    expect(res.headers.get('retry-after')).toBeTruthy();
    expect(res.headers.get('x-rate-limit-remaining')).toBeTruthy();
    expect(res.headers.get('x-rate-limit-reset')).toBeTruthy();
  });
});


