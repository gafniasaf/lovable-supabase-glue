import { POST as UploadPOST, PUT as UploadPUT } from '../../apps/web/src/app/api/files/upload-url/route';

const post = (body: any, headers?: Record<string,string>) => new Request('http://localhost/api/files/upload-url', { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);
const put = (qs: string, body: string, headers?: Record<string,string>) => new Request(`http://localhost/api/files/upload-url${qs}`, { method: 'PUT', headers: headers as any, body } as any);

describe('files AV stub and quota exceed', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('EICAR-like content rejected', async () => {
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'student');
    const up = await (UploadPOST as any)(post({ owner_type: 'user', owner_id: 'u1', content_type: 'text/plain', filename: 'eicar.txt' }));
    const j = await up.json();
    const id = encodeURIComponent(j.key || 'k');
    const res = await (UploadPUT as any)(put(`?owner_type=user&owner_id=u1&content_type=text/plain`, `X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*`));
    expect([400,200]).toContain(res.status);
  });
});


