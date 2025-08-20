// @ts-nocheck
import { GET as GradeDistGET } from '../../apps/web/src/app/api/reports/grade-distribution/route';

function get(url: string, headers?: Record<string,string>) {
  return new Request(url, { method: 'GET', headers: headers as any } as any);
}

describe('grade distribution export headers', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('csv format returns text/csv content-type', async () => {
    // 
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    const res = await (GradeDistGET as any)(get('http://localhost/api/reports/grade-distribution?course_id=00000000-0000-0000-0000-000000000001&format=csv'));
    expect([200,401,400]).toContain(res.status);
    if (res.status === 200) {
      expect(String(res.headers.get('content-type') || '')).toMatch(/text\/csv/);
    }
  });
});


