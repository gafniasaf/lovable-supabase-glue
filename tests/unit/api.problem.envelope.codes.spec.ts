import { GET as CoursesGET } from '../../apps/web/src/app/api/courses/route';
import { GET as HealthGET } from '../../apps/web/src/app/api/health/route';

const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);

describe('problem envelope invariants across codes', () => {
  test('unauthenticated → 401 with error and x-request-id', async () => {
    const res = await (CoursesGET as any)(get('http://localhost/api/courses'));
    expect(res.status).toBe(401);
    expect(res.headers.get('x-request-id')).toBeTruthy();
    const j = await res.json();
    expect(j?.error?.code).toBeTruthy();
  });

  test('health is 200 with x-request-id', async () => {
    const res = await (HealthGET as any)(get('http://localhost/api/health'));
    expect([200]).toContain(res.status);
    expect(res.headers.get('x-request-id')).toBeTruthy();
  });
});


