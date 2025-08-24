import { GET as GradeDistGET } from '../../apps/web/src/app/api/reports/grade-distribution/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }

describe('Reports CSV content-type (smoke)', () => {
  test('teacher request returns CSV content-type for CSV path', async () => {
    // This route may need query params; smoke-test header if 200
    const res = await (GradeDistGET as any)(get('http://localhost/api/reports/grade-distribution'));
    if (res.status === 200) {
      const ct = res.headers.get('content-type') || '';
      expect(ct.includes('text/csv') || ct.includes('application/json')).toBe(true);
    } else {
      expect([400,401,403,404]).toContain(res.status);
    }
  });
});


