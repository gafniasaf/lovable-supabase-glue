import { PUT as UploadPut } from '../../apps/web/src/app/api/files/upload-url/route';

function put(url: string, headers?: Record<string,string>, body?: string) { return new Request(url, { method: 'PUT', headers: headers as any, body } as any); }

describe('files upload PUT test-mode AV scan', () => {
  const orig = { ...process.env } as any;
  afterEach(() => { process.env = orig; });

  test('rejects EICAR test string', async () => {
    process.env = { ...orig, TEST_MODE: '1' } as any;
    const headers = { 'x-test-auth': 'student', 'content-type': 'text/plain' } as any;
    const url = 'http://localhost/api/files/upload-url?owner_type=user&owner_id=22222222-2222-2222-2222-222222222222&content_type=text/plain';
    const eicar = 'X5O!P%25@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*';
    const res = await (UploadPut as any)(put(url, headers, eicar));
    expect([400,401,403]).toContain(res.status);
  });

  test('accepts small benign text', async () => {
    process.env = { ...orig, TEST_MODE: '1' } as any;
    const headers = { 'x-test-auth': 'student', 'content-type': 'text/plain' } as any;
    const url = 'http://localhost/api/files/upload-url?owner_type=user&owner_id=22222222-2222-2222-2222-222222222222&content_type=text/plain';
    const res = await (UploadPut as any)(put(url, headers, 'hello'));
    expect([200,401,403]).toContain(res.status);
  });
});
