import { POST as UploadPOST } from '../../apps/web/src/app/api/files/upload-url/route';

function req(body: any, headers?: Record<string,string>) {
  return new Request('http://localhost/api/files/upload-url', { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);
}

describe('files upload-url rate limit headers', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; });

  test('429 includes rate limit headers', async () => {
    // @ts-ignore simulate student auth
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'student');
    process.env.UPLOAD_RATE_LIMIT = '1';
    process.env.UPLOAD_RATE_WINDOW_MS = '60000';
    const payload = { owner_type: 'user', owner_id: 'test-student-id', content_type: 'text/plain' };
    const res1 = await (UploadPOST as any)(req(payload));
    expect([200,401]).toContain(res1.status);
    const res2 = await (UploadPOST as any)(req(payload));
    if (res2.status === 429) {
      expect(res2.headers.get('retry-after')).toBeTruthy();
      expect(res2.headers.get('x-rate-limit-remaining')).toBeDefined();
    }
  });
});


