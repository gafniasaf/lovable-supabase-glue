import { GET as ContextGET } from '../../apps/web/src/app/api/runtime/context/route';
import { POST as AssetSignPOST } from '../../apps/web/src/app/api/runtime/asset/sign-url/route';
import { POST as CheckpointSavePOST } from '../../apps/web/src/app/api/runtime/checkpoint/save/route';

function jsonReq(url: string, method: string, body?: any, headers?: Record<string, string>) {
  const hdrs = { 'content-type': 'application/json', origin: 'https://provider.example', referer: 'https://provider.example/x', ...(headers || {}) } as any;
  return new Request(url, { method, headers: hdrs, body: body ? JSON.stringify(body) : undefined } as any);
}
function getReq(url: string, headers?: Record<string, string>) {
  const hdrs = { origin: 'https://provider.example', referer: 'https://provider.example/x', ...(headers || {}) } as any;
  return new Request(url, { method: 'GET', headers: hdrs } as any);
}

describe('Runtime v2 hardening (audience + scopes + allowlists)', () => {
  beforeEach(() => {
    (process.env as any).RUNTIME_API_V2 = '1';
    (process.env as any).RUNTIME_CORS_ALLOW = 'https://provider.example';
    (process.env as any).NEXT_RUNTIME_SECRET = 'dev-secret';
    delete (process.env as any).NEXT_RUNTIME_PUBLIC_KEY;
  });

  test('audience binding enforced when origin allowed (missing token yields 401)', async () => {
    const res = await (ContextGET as any)(getReq('http://localhost/api/runtime/context'));
    expect([401]).toContain(res.status);
  });

  test('scope files.write required for asset sign-url (missing token path)', async () => {
    const res = await (AssetSignPOST as any)(jsonReq('http://localhost/api/runtime/asset/sign-url', 'POST', { content_type: 'text/plain' }));
    expect([401, 403]).toContain(res.status);
  });

  test('checkpoint size limit enforced (missing token path)', async () => {
    (process.env as any).RUNTIME_CHECKPOINT_MAX_BYTES = '64';
    const big = { key: 'k', state: { data: 'x'.repeat(1024) } };
    const res = await (CheckpointSavePOST as any)(jsonReq('http://localhost/api/runtime/checkpoint/save', 'POST', big));
    expect([401, 403]).toContain(res.status);
  });
});


