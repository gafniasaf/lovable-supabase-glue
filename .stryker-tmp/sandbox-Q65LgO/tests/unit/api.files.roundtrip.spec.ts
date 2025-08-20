// @ts-nocheck
import { POST as UploadPOST, PUT as UploadPUT } from '../../apps/web/src/app/api/files/upload-url/route';
import { GET as DownloadGET } from '../../apps/web/src/app/api/files/download-url/route';

function makePost(body: any, headers?: Record<string, string>) {
  return new Request('http://localhost/api/files/upload-url', { method: 'POST', headers: { 'content-type': 'application/json', ...(headers || {}) }, body: JSON.stringify(body) });
}
function makePut(url: string, body: Blob | ArrayBuffer | string, headers?: Record<string, string>) {
  return new Request(url, { method: 'PUT', headers: { ...(headers || {}) }, body });
}
function makeGet(url: string, headers?: Record<string, string>) {
  return new Request(url, { headers: { ...(headers || {}) } });
}

describe('files round-trip', () => {
  beforeEach(() => { process.env.TEST_MODE = '1'; });

  test('upload-url → PUT bytes → download-url', async () => {
    // auth via cookie
    // 
    globalThis.__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'student');
    const up = await (UploadPOST as any)(makePost({ owner_type: 'user', owner_id: 'test-student-id', content_type: 'text/plain' }, { 'x-request-id': 'rid-rt' }));
    expect(up.headers.get('x-request-id')).toBe('rid-rt');
    const { url } = await up.json();
    const blob = new Blob([new TextEncoder().encode('hello')], { type: 'text/plain' });
    const put = await (UploadPUT as any)(makePut(`http://localhost${url}`, blob, { 'x-test-auth': 'student' }));
    expect(put.status).toBe(200);
    const { id, url: publicUrl } = await put.json();
    expect(id).toBeTruthy();
    const dl = await (DownloadGET as any)(makeGet(`http://localhost/api/files/download-url?id=${encodeURIComponent(id)}`, { 'x-test-auth': 'student' }));
    expect(dl.status).toBe(200);
    expect(dl.headers.get('content-type')).toBe('text/plain');
    const buf = new Uint8Array(await dl.arrayBuffer());
    expect(new TextDecoder().decode(buf)).toBe('hello');
    expect(publicUrl).toContain('/api/files/download-url');
  });
});


