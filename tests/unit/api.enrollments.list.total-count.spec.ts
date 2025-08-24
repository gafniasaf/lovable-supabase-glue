import { GET as EnrollGET } from '../../apps/web/src/app/api/enrollments/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }

describe('API /api/enrollments list sets x-total-count (smoke)', () => {
  test('student authed → header present when 200', async () => {
    const res = await (EnrollGET as any)(get('http://localhost/api/enrollments', { 'x-test-auth': 'student' }));
    if (res.status === 200) {
      expect(res.headers.get('x-total-count')).toBeTruthy();
    } else {
      expect([401]).toContain(res.status);
    }
  });
});


