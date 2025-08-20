// @ts-nocheck
import { POST as UploadPOST, PUT as UploadPUT } from '../../apps/web/src/app/api/files/upload-url/route';
import { GET as DownloadGET } from '../../apps/web/src/app/api/files/download-url/route';

function postJson(body: any, headers?: Record<string, string>) {
  return new Request('http://localhost/api/files/upload-url', { method: 'POST', headers: { 'content-type': 'application/json', ...(headers || {}) }, body: JSON.stringify(body) });
}
function putUrl(url: string, body?: Blob | ArrayBuffer | string, headers?: Record<string, string>) {
  return new Request(url, { method: 'PUT', headers: { ...(headers || {}) }, body });
}
function getUrl(url: string, headers?: Record<string, string>) {
  return new Request(url, { headers: { ...(headers || {}) } });
}

describe('files negative cases', () => {
  test('upload-url PUT without auth → 401', async () => {
    process.env.TEST_MODE = '1';
    const up = await (UploadPOST as any)(postJson({ owner_type: 'submission', owner_id: 'x' }, { 'x-test-auth': 'student' }));
    const { url } = await up.json();
    const res = await (UploadPUT as any)(putUrl(`http://localhost${url}`, new Blob([new Uint8Array([1,2,3])], { type: 'application/octet-stream' })));
    expect(res.status).toBe(401);
  });

  test('download-url missing id → 400; unknown id → 404', async () => {
    process.env.TEST_MODE = '1';
    // missing id
    // 
    globalThis.__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'student');
    let res = await (DownloadGET as any)(getUrl('http://localhost/api/files/download-url', { 'x-test-auth': 'student', 'x-request-id': 'xx' }));
    expect(res.status).toBe(400);
    expect(res.headers.get('x-request-id')).toBe('xx');
    // unknown id
    res = await (DownloadGET as any)(getUrl('http://localhost/api/files/download-url?id=does-not-exist', { 'x-test-auth': 'student', 'x-request-id': 'yy' }));
    expect(res.status).toBe(404);
    expect(res.headers.get('x-request-id')).toBe('yy');
  });
});


