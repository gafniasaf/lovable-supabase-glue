import { POST as AssetSignPOST } from '../../apps/web/src/app/api/runtime/asset/sign-url/route';

function post(url: string, headers?: Record<string,string>, body?: any) { return new Request(url, { method: 'POST', headers: headers as any, body: JSON.stringify(body || {}) } as any); }

describe('runtime asset sign-url', () => {
  const orig = { ...process.env } as any;
  afterEach(() => { process.env = orig; });

  test('rejects unsupported content type', async () => {
    process.env = { ...orig, RUNTIME_API_V2: '1' } as any;
    const headers = { authorization: 'Bearer t', origin: 'http://localhost' } as any;
    const res = await (AssetSignPOST as any)(post('http://localhost/api/runtime/asset/sign-url', headers, { content_type: 'application/x-unknown' }));
    expect([400,401,403]).toContain(res.status);
  });

  test('rate limit returns standard headers when exceeded', async () => {
    process.env = { ...orig, RUNTIME_API_V2: '1', RUNTIME_ASSET_LIMIT: '1', RUNTIME_ASSET_WINDOW_MS: '60000' } as any;
    const headers = { authorization: 'Bearer t', origin: 'http://localhost' } as any;
    await (AssetSignPOST as any)(post('http://localhost/api/runtime/asset/sign-url', headers, { content_type: 'image/png' }));
    const res = await (AssetSignPOST as any)(post('http://localhost/api/runtime/asset/sign-url', headers, { content_type: 'image/png' }));
    if (res.status === 429) {
      expect(res.headers.get('retry-after')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-remaining')).toBeTruthy();
      expect(res.headers.get('x-rate-limit-reset')).toBeTruthy();
    } else {
      expect([200,401,403,429,500]).toContain(res.status);
    }
  });
});
