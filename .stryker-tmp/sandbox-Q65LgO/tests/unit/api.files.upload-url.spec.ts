// @ts-nocheck
import { POST as UploadPOST } from '../../apps/web/src/app/api/files/upload-url/route';

function makeReq(body: any, headers?: Record<string, string>) {
  return new Request('http://localhost/api/files/upload-url', { method: 'POST', headers: { 'content-type': 'application/json', ...(headers || {}) }, body: JSON.stringify(body) });
}

describe('api.files.upload-url', () => {
  beforeEach(() => { process.env.TEST_MODE = '1'; });

  test('requires auth', async () => {
    const res = await (UploadPOST as any)(makeReq({ owner_type: 'submission', owner_id: 'x', content_type: 'text/plain' }));
    expect(res.status).toBe(401);
  });

  test('returns signed fields in test-mode', async () => {
    // simulate cookie-based auth like route does, use user owner to satisfy scoping
    // 
    globalThis.__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'student');
    const res = await (UploadPOST as any)(makeReq({ owner_type: 'user', owner_id: 'test-student-id', content_type: 'text/plain' }, { 'x-test-auth': 'student' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.url).toContain('/api/files/upload-url');
    expect(json.fields).toBeDefined();
  });
});


