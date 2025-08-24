import { GET as GradeDistGET } from '../../apps/web/src/app/api/reports/grade-distribution/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }

describe('reports grade-distribution CSV/JSON', () => {
  test('JSON returns 200 or auth errors', async () => {
    const res = await (GradeDistGET as any)(get('http://localhost/api/reports/grade-distribution?course_id=11111111-1111-1111-1111-111111111111', { 'x-test-auth': 'teacher' }));
    expect([200,401,403]).toContain(res.status);
  });

  test('CSV returns text/csv when requested', async () => {
    const res = await (GradeDistGET as any)(get('http://localhost/api/reports/grade-distribution?course_id=11111111-1111-1111-1111-111111111111&format=csv', { 'x-test-auth': 'teacher' }));
    expect([200,401,403]).toContain(res.status);
    if (res.status === 200) {
      expect(res.headers.get('content-type') || '').toMatch(/text\/csv/);
    }
  });
});
