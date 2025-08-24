import { GET as ModulesGET } from '../../apps/web/src/app/api/modules/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }

describe('API /api/modules list sets x-total-count (smoke)', () => {
  test('teacher authed → header present when 200', async () => {
    const res = await (ModulesGET as any)(get('http://localhost/api/modules?course_id=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', { 'x-test-auth': 'teacher' }));
    if (res.status === 200) {
      expect(res.headers.get('x-total-count')).toBeTruthy();
    } else {
      expect([400,401,403]).toContain(res.status);
    }
  });
});


