import { GET as HealthSummariesGET } from '../../apps/web/src/app/api/providers/health/summaries/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }

describe('providers health summaries admin-only', () => {
  test('unauthenticated -> 401', async () => {
    const res = await (HealthSummariesGET as any)(get('http://localhost/api/providers/health/summaries'));
    expect(res.status).toBe(401);
  });

  test('non-admin -> 403', async () => {
    const res = await (HealthSummariesGET as any)(get('http://localhost/api/providers/health/summaries', { 'x-test-auth': 'teacher' }));
    expect([403,401]).toContain(res.status);
  });
});
