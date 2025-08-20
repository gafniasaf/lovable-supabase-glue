import { GET as CoursesGET } from '../../apps/web/src/app/api/courses/route';

const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);

describe('x-request-id present on 200 responses', () => {
  test('courses GET emits x-request-id', async () => {
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    const res = await (CoursesGET as any)(get('http://localhost/api/courses'));
    expect([200,401,403]).toContain(res.status);
    expect(res.headers.get('x-request-id')).toBeTruthy();
  });
});


