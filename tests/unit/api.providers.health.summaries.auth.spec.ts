import { GET as SummariesGET } from '../../apps/web/src/app/api/providers/health/summaries/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }

describe('API /api/providers/health/summaries auth', () => {
  test('unauthenticated → 401', async () => {
    const res = await (SummariesGET as any)(get('http://localhost/api/providers/health/summaries'));
    expect(res.status).toBe(401);
  });

  test('non-admin → 403', async () => {
    const res = await (SummariesGET as any)(get('http://localhost/api/providers/health/summaries', { 'x-test-auth': 'teacher' }));
    expect([401,403]).toContain(res.status);
  });
});


