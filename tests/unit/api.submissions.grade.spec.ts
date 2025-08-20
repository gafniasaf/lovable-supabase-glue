import { PATCH as SubmissionsPATCH } from '../../apps/web/src/app/api/submissions/route';

function makeReq(url: string, body: any, headers?: Record<string, string>) {
  return new Request(url, { method: 'PATCH', headers: { 'content-type': 'application/json', ...(headers || {}) }, body: JSON.stringify(body) });
}

describe('PATCH /api/submissions grade', () => {
  beforeEach(() => { process.env.TEST_MODE = '1'; });

  test('teacher-only and validation envelope', async () => {
    const url = 'http://localhost/api/submissions?id=00000000-0000-0000-0000-000000000001';
    let res = await (SubmissionsPATCH as any)(makeReq(url, { score: 90 }));
    expect(res.status).toBe(401);
    res = await (SubmissionsPATCH as any)(makeReq(url, { score: 90 }, { 'x-test-auth': 'student' }));
    expect(res.status).toBe(403);
    res = await (SubmissionsPATCH as any)(makeReq(url, { score: 'bad' } as any, { 'x-test-auth': 'teacher' }));
    expect(res.status).toBe(400);
  });
});


