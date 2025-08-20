import { POST as UploadPOST, PUT as UploadPUT } from '../../apps/web/src/app/api/files/upload-url/route';
import { GET as DownloadGET } from '../../apps/web/src/app/api/files/download-url/route';

function postJson(body: any, headers?: Record<string, string>) {
  return new Request('http://localhost/api/files/upload-url', { method: 'POST', headers: { 'content-type': 'application/json', ...(headers || {}) }, body: JSON.stringify(body) });
}
function putUrl(url: string, body: Blob | ArrayBuffer | string, headers?: Record<string, string>) {
  return new Request(url, { method: 'PUT', headers: { ...(headers || {}) }, body });
}
function getUrl(url: string, headers?: Record<string, string>) {
  return new Request(url, { headers: { ...(headers || {}) } });
}

describe('files default content_type', () => {
  test('defaults to application/octet-stream when omitted', async () => {
    process.env.TEST_MODE = '1';
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'student');
    const up = await (UploadPOST as any)(postJson({ owner_type: 'user', owner_id: 'test-student-id' }, { 'x-test-auth': 'student' }));
    const { url } = await up.json();
    const put = await (UploadPUT as any)(putUrl(`http://localhost${url}`, new Blob([new TextEncoder().encode('x')])));
    const { id } = await put.json();
    const dl = await (DownloadGET as any)(getUrl(`http://localhost/api/files/download-url?id=${id}`, { 'x-test-auth': 'student' }));
    expect(dl.headers.get('content-type')).toBe('application/octet-stream');
  });
});


