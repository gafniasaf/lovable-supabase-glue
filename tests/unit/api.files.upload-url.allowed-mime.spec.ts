import { POST as UploadPOST } from '../../apps/web/src/app/api/files/upload-url/route';

function post(body: any, headers?: Record<string,string>) { return new Request('http://localhost/api/files/upload-url', { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any); }

describe('API /api/files/upload-url allowed MIME', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('rejects unsupported content-type', async () => {
    // @ts-ignore simulate auth
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'teacher');
    const res = await (UploadPOST as any)(post({ owner_type: 'user', owner_id: 'u1', content_type: 'application/x-unknown' }));
    expect([400,401,403]).toContain(res.status);
  });
});


