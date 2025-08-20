import { GET as EngagementGET } from '../../apps/web/src/app/api/reports/engagement/route';
import { GET as GradeDistGET } from '../../apps/web/src/app/api/reports/grade-distribution/route';

const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);

describe('reports endpoints headers and DTO-like responses', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('GET /api/reports/engagement returns x-request-id and JSON', async () => {
    const res = await (EngagementGET as any)(get('http://localhost/api/reports/engagement?course_id=00000000-0000-0000-0000-000000000001'));
    expect([200,400,401,403]).toContain(res.status);
    expect(res.headers.get('x-request-id')).toBeTruthy();
    const ct = res.headers.get('content-type') || '';
    expect(ct.includes('application/json')).toBeTruthy();
  });

  test('GET /api/reports/grade-distribution CSV includes header and x-request-id', async () => {
    const res = await (GradeDistGET as any)(get('http://localhost/api/reports/grade-distribution?course_id=00000000-0000-0000-0000-000000000001&format=csv'));
    expect([200,400,401,403]).toContain(res.status);
    expect(res.headers.get('x-request-id')).toBeTruthy();
    const ct = res.headers.get('content-type') || '';
    expect(ct.includes('text/csv')).toBeTruthy();
  });
});
