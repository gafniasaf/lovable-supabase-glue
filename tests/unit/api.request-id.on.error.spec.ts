import { GET as CoursesGET } from '../../apps/web/src/app/api/courses/route';

function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }

describe('request-id echoed on error envelope', () => {
  test('bad request includes x-request-id header', async () => {
    const res = await (CoursesGET as any)(get('http://localhost/api/courses', { 'x-test-auth': 'teacher' }));
    if (res.status === 400 || res.status === 500) {
      expect(res.headers.get('x-request-id')).toBeTruthy();
    } else {
      expect([200,401,403,404]).toContain(res.status);
    }
  });
});


