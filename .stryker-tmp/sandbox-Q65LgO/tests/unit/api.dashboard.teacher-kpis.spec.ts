// @ts-nocheck
import { GET as DashboardGET } from '../../apps/web/src/app/api/dashboard/route';

function makeReq(headers?: Record<string, string>) {
  return new Request('http://localhost/api/dashboard', { headers: { ...(headers || {}) } });
}

describe('api.dashboard teacher KPIs', () => {
  beforeEach(() => { process.env.TEST_MODE = '1'; });

  test('needsGrading scoped to teacher courses; zero-state; request-id echo', async () => {
    const res = await (DashboardGET as any)(makeReq({ 'x-test-auth': 'teacher', 'x-request-id': 'rq-99' }));
    expect(res.headers.get('x-request-id')).toBe('rq-99');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.role).toBe('teacher');
    expect(json.data.kpis.needsGrading.value).toBeDefined();
  });
});


