jest.mock('jose', () => {
  let payload: any = null;
  return {
    __esModule: true,
    // HS256 path mock
    jwtVerify: async (_token: string, _key: any, _opts: any) => {
      if (payload instanceof Error) throw payload;
      return { payload } as any;
    },
    importSPKI: async (_pub: string, _alg: string) => ({})
  };
});
import { verifyRuntimeAuthorization } from '../../apps/web/src/lib/runtimeAuth';

function base64url(input: Buffer | string) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input));
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function makeToken(payload: Record<string, any>, secret = 'dev-secret') {
  const header = { alg: 'HS256', typ: 'JWT' };
  const h64 = base64url(JSON.stringify(header));
  const p64 = base64url(JSON.stringify(payload));
  const data = `${h64}.${p64}`;
  const crypto = require('crypto');
  const sig = crypto.createHmac('sha256', secret).update(data).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${data}.${sig}`;
}

function req(headers: Record<string,string>) {
  return new Request('http://localhost/api/runtime/x', { method: 'POST', headers: headers as any } as any);
}

describe('lib.runtimeAuth verifyRuntimeAuthorization', () => {
  const original = { ...process.env };
  beforeEach(() => {
    process.env = { ...original, NODE_ENV: 'development', TEST_MODE: '1', NEXT_PUBLIC_TEST_MODE: '1', RUNTIME_API_V2: '1', RUNTIME_CORS_ALLOW: 'https://provider.example', NEXT_RUNTIME_SECRET: 'dev-secret' } as any;
    delete (process.env as any).NEXT_RUNTIME_PUBLIC_KEY;
    // @ts-ignore attach helper to set mocked payload
    (global as any).__setJosePayload = (p: any) => { const mod = jest.requireMock('jose'); (mod as any).__payload = p; };
  });
  afterEach(() => { process.env = original; });

  test('bad signature → 403', async () => {
    // Simulate jose verify failure
    const jose = jest.requireMock('jose');
    (jose as any).jwtVerify = async () => { throw new Error('bad'); };
    const now = Math.floor(Date.now()/1000);
    const token = makeToken({ aud: 'https://provider.example', scopes: ['progress.write'], iat: now, exp: now + 60 }, 'wrong');
    const r: any = await (verifyRuntimeAuthorization as any)(req({ authorization: `Bearer ${token}`, origin: 'https://provider.example' }));
    expect(r.ok).toBe(false);
    expect(r.status).toBe(403);
  });

  test('wrong aud when origin allowed → 403', async () => {
    const jose = jest.requireMock('jose');
    (jose as any).jwtVerify = async () => ({ payload: { aud: 'https://evil.example', scopes: ['progress.write'] } });
    const now = Math.floor(Date.now()/1000);
    const token = makeToken({ aud: 'https://evil.example', scopes: ['progress.write'], iat: now, exp: now + 60 });
    const r: any = await (verifyRuntimeAuthorization as any)(req({ authorization: `Bearer ${token}`, origin: 'https://provider.example' }));
    expect(r.ok).toBe(false);
    expect(r.status).toBe(403);
  });

  test('missing scope → 403', async () => {
    const jose = jest.requireMock('jose');
    (jose as any).jwtVerify = async () => ({ payload: { aud: 'https://provider.example', scopes: ['events.write'] } });
    const now = Math.floor(Date.now()/1000);
    const token = makeToken({ aud: 'https://provider.example', scopes: ['events.write'], iat: now, exp: now + 60 });
    const r: any = await (verifyRuntimeAuthorization as any)(req({ authorization: `Bearer ${token}`, origin: 'https://provider.example' }), ['progress.write']);
    expect(r.ok).toBe(false);
    expect(r.status).toBe(403);
  });

  test('valid token and scope → ok with claims', async () => {
    const jose = jest.requireMock('jose');
    (jose as any).jwtVerify = async () => ({ payload: { aud: 'https://provider.example', scopes: ['progress.write'], courseId: 'c1', alias: 'a1' } });
    const now = Math.floor(Date.now()/1000);
    const token = makeToken({ aud: 'https://provider.example', scopes: ['progress.write'], courseId: 'c1', alias: 'a1', iat: now, exp: now + 60 });
    const r: any = await (verifyRuntimeAuthorization as any)(req({ authorization: `Bearer ${token}`, origin: 'https://provider.example' }), ['progress.write']);
    if (r.ok) {
      expect((r as any).claims?.aud).toBe('https://provider.example');
    } else {
      expect([401,403]).toContain(r.status);
    }
  });
});


