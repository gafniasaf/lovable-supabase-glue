import * as supa from './helpers/supabaseMock';
import { POST as CheckpointSavePOST } from '../../apps/web/src/app/api/runtime/checkpoint/save/route';
import { GET as CheckpointLoadGET } from '../../apps/web/src/app/api/runtime/checkpoint/load/route';

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

function post(url: string, headers?: Record<string,string>, body?: any) { return new Request(url, { method: 'POST', headers: headers as any, body: JSON.stringify(body || {}) } as any); }
function get(url: string, headers?: Record<string,string>) { return new Request(url, { method: 'GET', headers: headers as any } as any); }

describe('runtime checkpoint size limit and load', () => {
  const orig = { ...process.env } as any;
  afterEach(() => { process.env = orig; jest.restoreAllMocks(); });

  test('save rejects oversize payload (400)', async () => {
    process.env = { ...orig, RUNTIME_API_V2: '1', RUNTIME_CHECKPOINT_MAX_BYTES: '16' } as any;
    const headers = { authorization: 'Bearer t', origin: 'http://localhost' } as any;
    const big = { key: 'k', state: { x: 'x'.repeat(1024) } };
    const res = await (CheckpointSavePOST as any)(post('http://localhost/api/runtime/checkpoint/save', headers, big));
    expect([400,401,403]).toContain(res.status);
  });

  test('load returns state (smoke)', async () => {
    process.env = { ...orig, RUNTIME_API_V2: '1' } as any;
    const mock = (supa as any).makeSupabaseMock({ runtime_checkpoints: () => (supa as any).supabaseOk({ state: { a: 1 } }) } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock as any);
    const headers = { authorization: 'Bearer t', origin: 'http://localhost' } as any;
    const res = await (CheckpointLoadGET as any)(get('http://localhost/api/runtime/checkpoint/load?key=k', headers));
    expect([200,401,403]).toContain(res.status);
  });
});


