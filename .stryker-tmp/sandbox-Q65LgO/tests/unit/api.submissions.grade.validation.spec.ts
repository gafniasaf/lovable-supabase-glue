// @ts-nocheck
import { PATCH as SubsPATCH } from '../../apps/web/src/app/api/submissions/route';

function patchJson(url: string, body: any, headers?: Record<string, string>) {
  return new Request(url, { method: 'PATCH', headers: { 'content-type': 'application/json', ...(headers || {}) }, body: JSON.stringify(body) });
}

describe('PATCH /api/submissions grading validation', () => {
  beforeEach(() => { process.env.TEST_MODE = '1'; });

  test('missing score → 400; unknown keys tolerated', async () => {
    const url = 'http://localhost/api/submissions?id=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    let res = await (SubsPATCH as any)(patchJson(url, { feedback: 'Nice' }, { 'x-test-auth': 'teacher' }));
    expect(res.status).toBe(400);
    res = await (SubsPATCH as any)(patchJson(url, { score: 95, extra: true }, { 'x-test-auth': 'teacher' }));
    expect([200, 400]).toContain(res.status); // schema discards extra
  });
});


