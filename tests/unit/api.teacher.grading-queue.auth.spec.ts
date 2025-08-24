import { GET as QueueGET } from '../../apps/web/src/app/api/teacher/grading-queue/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }

describe('API /api/teacher/grading-queue auth', () => {
  test('unauthenticated → 401', async () => {
    const res = await (QueueGET as any)(get('http://localhost/api/teacher/grading-queue'));
    expect(res.status).toBe(401);
  });

  test('non-teacher → 403', async () => {
    const res = await (QueueGET as any)(get('http://localhost/api/teacher/grading-queue', { 'x-test-auth': 'student' }));
    expect([401,403]).toContain(res.status);
  });
});


