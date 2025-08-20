// @ts-nocheck
import { GET as SubsGET } from '../../apps/web/src/app/api/submissions/route';

function getUrl(url: string, headers?: Record<string, string>) {
  return new Request(url, { headers: { ...(headers || {}) } });
}

describe('GET /api/submissions requires assignment_id and auth', () => {
  beforeEach(() => { process.env.TEST_MODE = '1'; });

  test('401 when unauth; 400 when missing assignment_id', async () => {
    let res = await (SubsGET as any)(getUrl('http://localhost/api/submissions?assignment_id=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'));
    expect(res.status).toBe(401);
    // 
    globalThis.__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'teacher');
    res = await (SubsGET as any)(getUrl('http://localhost/api/submissions', { 'x-test-auth': 'teacher' }));
    expect(res.status).toBe(400);
  });
});


