// @ts-nocheck
import { GET as CoursesGET } from '../../apps/web/src/app/api/courses/route';
import { GET as LessonsGET } from '../../apps/web/src/app/api/lessons/route';
import { GET as UserGET } from '../../apps/web/src/app/api/user/route';

function get(url: string, headers?: Record<string,string>) {
  return new Request(url, { method: 'GET', headers: headers as any } as any);
}

describe('Problem envelope invariants', () => {
  beforeEach(() => { jest.resetModules(); delete (process.env as any).TEST_MODE; });

  test('401 responses include error envelope and x-request-id', async () => {
    const res = await (CoursesGET as any)(get('http://localhost/api/courses'));
    expect(res.status).toBe(401);
    expect(res.headers.get('x-request-id')).toBeTruthy();
    const body = await res.json();
    expect(body?.error?.code).toBeTruthy();
    expect(body?.requestId).toBeTruthy();
  });

  test('400 bad request includes envelope', async () => {
    const res = await (LessonsGET as any)(get('http://localhost/api/lessons'));
    expect([400,401]).toContain(res.status);
    if (res.status === 400) {
      const body = await res.json();
      expect(body?.error?.code).toBe('BAD_REQUEST');
      expect(body?.requestId).toBeTruthy();
    }
  });
});


