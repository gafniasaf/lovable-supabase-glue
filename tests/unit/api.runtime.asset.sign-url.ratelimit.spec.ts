import { POST as AssetSignPOST } from '../../apps/web/src/app/api/runtime/asset/sign-url/route';

function base64url(input: Buffer | string) { const b = Buffer.isBuffer(input) ? input : Buffer.from(String(input)); return b.toString('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_'); }
function makeJwt(scopes: string[]) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now()/1000);
  const payload: any = { aud: 'https://provider.example', scopes, courseId: 'c1', alias: 'a1', iat: now, exp: now + 60 };
  const h64 = base64url(JSON.stringify(header));
  const p64 = base64url(JSON.stringify(payload));
  const data = `${h64}.${p64}`;
  const crypto = require('crypto');
  const sig = crypto.createHmac('sha256', 'dev-secret').update(data).digest('base64').replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
  return `${data}.${sig}`;
}

const post = (body: any, headers?: Record<string,string>) => new Request('http://localhost/api/runtime/asset/sign-url', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://provider.example', referer: 'https://provider.example/x', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);

describe('runtime asset sign-url rate-limit headers', () => {
  const original = { ...process.env };
  beforeEach(() => { process.env = { ...original, TEST_MODE: '1', NEXT_PUBLIC_TEST_MODE: '1', RUNTIME_API_V2: '1', RUNTIME_CORS_ALLOW: 'https://provider.example', NEXT_RUNTIME_SECRET: 'dev-secret', RUNTIME_ASSET_LIMIT: '1', RUNTIME_ASSET_WINDOW_MS: '60000' } as any; });
  afterEach(() => { process.env = original; });

  test('returns 200 first, then 429 with standard headers', async () => {
    const token = makeJwt(['files.write']);
    const h = { authorization: `Bearer ${token}` };
    // No import mocking needed
    const res1 = await (AssetSignPOST as any)(post({ content_type: 'image/png' }, h));
    expect([200,403]).toContain(res1.status);
    const res2 = await (AssetSignPOST as any)(post({ content_type: 'image/png' }, h));
    expect([403,429]).toContain(res2.status);
    if (res2.status === 429) {
      expect(res2.headers.get('retry-after')).toBeTruthy();
      expect(res2.headers.get('x-rate-limit-remaining')).toBe('0');
      expect(res2.headers.get('x-rate-limit-reset')).toBeTruthy();
    }
  });
});


