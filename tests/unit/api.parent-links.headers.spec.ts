import { POST as PLPost, DELETE as PLDelete, GET as PLGet } from '../../apps/web/src/app/api/parent-links/route';

const post = (body: any, headers?: Record<string,string>) => new Request('http://localhost/api/parent-links', { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);
const del = (body: any, headers?: Record<string,string>) => new Request('http://localhost/api/parent-links', { method: 'DELETE', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);
const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);

describe('parent-links headers & guards', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('POST returns x-request-id or 401/403 with header', async () => {
    // @ts-ignore simulate admin
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'admin');
    const res = await (PLPost as any)(post({ parent_id: 'test-parent', student_id: 'test-student' }));
    expect([201,401,403]).toContain(res.status);
    expect(res.headers.get('x-request-id')).toBeTruthy();
  });

  test('GET returns x-request-id', async () => {
    // @ts-ignore simulate admin
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'admin');
    const res = await (PLGet as any)(get('http://localhost/api/parent-links?parent_id=00000000-0000-0000-0000-000000000001'));
    expect([200,401,403,400]).toContain(res.status);
    expect(res.headers.get('x-request-id')).toBeTruthy();
  });
});
