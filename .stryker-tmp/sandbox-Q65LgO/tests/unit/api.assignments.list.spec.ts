// @ts-nocheck
import { GET as AssignGET } from '../../apps/web/src/app/api/assignments/route';

function makeReq(url: string, headers?: Record<string, string>) {
  return new Request(url, { headers: { ...(headers || {}) } });
}

describe('GET /api/assignments list', () => {
  beforeEach(() => { process.env.TEST_MODE = '1'; });

  test('requires course_id and auth', async () => {
    let res = await (AssignGET as any)(makeReq('http://localhost/api/assignments?course_id=00000000-0000-0000-0000-000000000001'));
    expect(res.status).toBe(401);
    res = await (AssignGET as any)(makeReq('http://localhost/api/assignments', { 'x-test-auth': 'student' }));
    expect(res.status).toBe(400);
  });
});


