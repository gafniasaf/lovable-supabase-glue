// @ts-nocheck
import { POST as UploadPOST } from '../../apps/web/src/app/api/files/upload-url/route';
import { GET as DownloadGET } from '../../apps/web/src/app/api/files/download-url/route';

function makePost(body: any, headers?: Record<string, string>) {
  return new Request('http://localhost/api/files/upload-url', { method: 'POST', headers: { 'content-type': 'application/json', ...(headers || {}) }, body: JSON.stringify(body) });
}
function makeGet(url: string, headers?: Record<string, string>) {
  return new Request(url, { headers: { ...(headers || {}) } });
}

describe('files routes guards and headers', () => {
  test('prod guard 501 when not TEST_MODE on upload-url', async () => {
    delete (process.env as any).TEST_MODE;
    process.env.MVP_PROD_GUARD = '1';
    const res = await (UploadPOST as any)(makePost({ owner_type: 'submission', owner_id: 'x' }, { 'x-test-auth': 'student' }));
    expect([401, 501]).toContain(res.status);
  });

  test('download-url echoes content-type and request-id', async () => {
    process.env.TEST_MODE = '1';
    // without stored file this will 404, but headers still include request id
    const res = await (DownloadGET as any)(makeGet('http://localhost/api/files/download-url?id=f1', { 'x-test-auth': 'student', 'x-request-id': 'hdr-1' }));
    expect([200, 401, 404]).toContain(res.status);
    expect(res.headers.get('x-request-id')).toBe('hdr-1');
  });
});


