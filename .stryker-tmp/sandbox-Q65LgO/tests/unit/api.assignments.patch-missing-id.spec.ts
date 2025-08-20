// @ts-nocheck
import { PATCH as AssignPATCH } from '../../apps/web/src/app/api/assignments/route';

function patchJson(url: string, body: any, headers?: Record<string, string>) {
  return new Request(url, { method: 'PATCH', headers: { 'content-type': 'application/json', ...(headers || {}) }, body: JSON.stringify(body) });
}

describe('PATCH /api/assignments missing id', () => {
  test('returns 400 and echoes x-request-id', async () => {
    process.env.TEST_MODE = '1';
    const res = await (AssignPATCH as any)(patchJson('http://localhost/api/assignments', { title: 'X' }, { 'x-test-auth': 'teacher', 'x-request-id': 'a-p1' }));
    expect(res.status).toBe(400);
    expect(res.headers.get('x-request-id')).toBe('a-p1');
  });
});


