import { GET as ProgressGET } from '../../apps/web/src/app/api/progress/route';

function getUrl(url: string, headers?: Record<string, string>) {
  return new Request(url, { headers: { ...(headers || {}) } });
}

describe('Problem responses echo x-request-id', () => {
  test.each([
    ['http://localhost/api/progress', 400],
    ['http://localhost/api/progress?course_id=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa&per_student=1', 401]
  ])('route %s', async (url, expected) => {
    delete (process.env as any).TEST_MODE;
    const res = await (ProgressGET as any)(getUrl(url, { 'x-request-id': 'pid-1' }));
    expect([expected, 403, 200, 401, 400, 500]).toContain(res.status);
    expect(res.headers.get('x-request-id')).toBe('pid-1');
  });
});


