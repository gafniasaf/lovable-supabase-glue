import { PATCH as AssignPATCH } from '../../apps/web/src/app/api/assignments/route';

describe('PATCH /api/assignments empty body validation', () => {
  test('returns 400 when body has no fields', async () => {
    process.env.TEST_MODE = '1';
    const req = new Request('http://localhost/api/assignments?id=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', 'x-test-auth': 'teacher', 'x-request-id': 'ap-eb' },
      body: JSON.stringify({})
    });
    const res = await (AssignPATCH as any)(req);
    expect(res.status).toBe(400);
    expect(res.headers.get('x-request-id')).toBe('ap-eb');
  });
});


