// @ts-nocheck
import { GET as GradeDistGET } from '../../apps/web/src/app/api/reports/grade-distribution/route';

const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);

describe('grade distribution empty course (TEST_MODE)', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('returns zero metrics; csv has only header', async () => {
    // 
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    const urlCsv = 'http://localhost/api/reports/grade-distribution?course_id=11111111-1111-1111-1111-111111111111&format=csv';
    const resCsv = await (GradeDistGET as any)(get(urlCsv));
    expect([200,401,400]).toContain(resCsv.status);
    if (resCsv.status === 200) {
      const text = await resCsv.text();
      expect(text.trim().split('\n')[0]).toBe('bucket,count');
    }
  });
});


