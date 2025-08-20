import { GET as AssignmentsGET } from "../../apps/web/src/app/api/assignments/route";

function makeGet(url: string, headers?: Record<string, string>) {
  return new Request(url, { method: 'GET', headers: { ...(headers || {}) } });
}

describe('GET /api/assignments query validation', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('rejects unknown query keys (strict)', async () => {
    const res = await (AssignmentsGET as any)(makeGet('http://localhost/api/assignments?course_id=00000000-0000-0000-0000-000000000123&extra=1', { 'x-test-auth': 'teacher' }));
    expect(res.status).toBe(400);
  });
});


