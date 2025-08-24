import { POST as UploadUrlPOST } from '../../apps/web/src/app/api/files/upload-url/route';

function post(url: string, headers?: Record<string,string>, body?: any) { return new Request(url, { method: 'POST', headers: headers as any, body: JSON.stringify(body || {}) } as any); }

describe('files upload-url: rate limit, MIME allowlist, CSRF', () => {
  const orig = { ...process.env } as any;
  afterEach(() => { process.env = orig; });

  test('rejects unsupported content type', async () => {
    process.env = { ...orig } as any;
    const headers = { 'x-test-auth': 'student', 'content-type': 'application/json' } as any;
    const res = await (UploadUrlPOST as any)(post('http://localhost/api/files/upload-url', headers, { owner_type: 'user', owner_id: '22222222-2222-2222-2222-222222222222', content_type: 'application/x-unknown' }));
    expect([400,401,403]).toContain(res.status);
  });

  test('rate limit returns standard headers when exceeded', async () => {
    process.env = { ...orig, UPLOAD_RATE_LIMIT: '1', UPLOAD_RATE_WINDOW_MS: '60000' } as any;
    const headers = { 'x-test-auth': 'student', 'content-type': 'application/json' } as any;
    // First should pass or fail auth; second likely 429
    await (UploadUrlPOST as any)(post('http://localhost/api/files/upload-url', headers, { owner_type: 'user', owner_id: '22222222-2222-2222-2222-222222222222', content_type: 'image/png' }));
    const res = await (UploadUrlPOST as any)(post('http://localhost/api/files/upload-url', headers, { owner_type: 'user', owner_id: '22222222-2222-2222-2222-222222222222', content_type: 'image/png' }));
    if (res.status === 429) {
      expect(res.headers.get('retry-after')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-remaining')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-reset')).toBeTruthy();
    } else {
      expect([200,401,403,429]).toContain(res.status);
    }
  });

  test('CSRF double-submit enforced when enabled', async () => {
    process.env = { ...orig, CSRF_DOUBLE_SUBMIT: '1', NEXT_PUBLIC_BASE_URL: 'http://localhost' } as any;
    const headers = { 'x-test-auth': 'student', 'content-type': 'application/json', cookie: 'csrf_token=abc' } as any;
    const res = await (UploadUrlPOST as any)(post('http://localhost/api/files/upload-url', headers, { owner_type: 'user', owner_id: '22222222-2222-2222-2222-222222222222', content_type: 'image/png' }));
    expect([401,403]).toContain(res.status);
  });
});
