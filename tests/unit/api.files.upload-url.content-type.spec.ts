import { POST as UploadUrlPOST } from '../../apps/web/src/app/api/files/upload-url/route';

const post = (body: any) => new Request('http://localhost/api/files/upload-url', { method: 'POST', headers: { 'content-type': 'application/json' } as any, body: JSON.stringify(body) } as any);

describe('files upload-url content-type allowlist', () => {
  beforeEach(() => {
    // @ts-ignore simulate auth
    (globalThis as any).__TEST_HEADERS_STORE__ = (globalThis as any).__TEST_HEADERS_STORE__ || { headers: new Map(), cookies: new Map() };
    // @ts-ignore
    (globalThis as any).__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'student');
  });

  test('unsupported content type -> 400', async () => {
    const res = await (UploadUrlPOST as any)(post({ owner_type: 'user', owner_id: 'u1', content_type: 'application/x-foo' }));
    expect(res.status).toBe(400);
  });
});


