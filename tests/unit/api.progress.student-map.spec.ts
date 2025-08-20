import { GET as ProgressGET } from '../../apps/web/src/app/api/progress/route';

function makeReq(url: string, headers?: Record<string, string>) {
  return new Request(url, { headers: { ...(headers || {}) } });
}

describe('GET /api/progress student map', () => {
  beforeEach(() => {
    process.env.TEST_MODE = '1';
  });

  test('requires auth (401 Problem)', async () => {
    const res = await (ProgressGET as any)(makeReq('http://localhost/api/progress?course_id=x'));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error?.code).toBeDefined();
    expect(json.requestId).toBeDefined();
  });

  test('returns student map (empty in TEST_MODE) and echoes request-id', async () => {
    const res = await (ProgressGET as any)(makeReq('http://localhost/api/progress?course_id=00000000-0000-0000-0000-000000000001', { 'x-test-auth': 'student', 'x-request-id': 'rid-1' }));
    expect(res.headers.get('x-request-id')).toBe('rid-1');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(typeof json).toBe('object');
  });

  test('400 when course_id missing', async () => {
    const res = await (ProgressGET as any)(makeReq('http://localhost/api/progress', { 'x-test-auth': 'student' }));
    expect(res.status).toBe(400);
  });
});


