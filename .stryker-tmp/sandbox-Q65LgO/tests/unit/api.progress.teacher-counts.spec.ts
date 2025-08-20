// @ts-nocheck
import { GET as ProgressGET } from '../../apps/web/src/app/api/progress/route';

function makeReq(url: string, headers?: Record<string, string>) {
  return new Request(url, { headers: { ...(headers || {}) } });
}

describe('GET /api/progress for_teacher=1', () => {
  beforeEach(() => { process.env.TEST_MODE = '1'; });

  test('teacher counts path returns 200 with counts object', async () => {
    const url = 'http://localhost/api/progress?course_id=00000000-0000-0000-0000-000000000001&for_teacher=1';
    const res = await (ProgressGET as any)(makeReq(url, { 'x-test-auth': 'teacher' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(typeof json).toBe('object');
  });
});


