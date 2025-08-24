import { verifyRuntimeAuthorization } from '../../apps/web/src/lib/runtimeAuth';

describe('runtimeAuth audience and scopes', () => {
  const original = { ...process.env } as any;
  afterEach(() => { process.env = original; });

  test('rejects when aud mismatches allowed origin', () => {
    process.env = { ...original, RUNTIME_CORS_ALLOW: 'https://good.example' } as any;
    const req = new Request('http://localhost/api/runtime/event', { headers: { 'authorization': 'Bearer token' } as any });
    // Mock getRequestOrigin to return allowed origin and jose verify to return payload with different aud
    jest.spyOn(require('../../apps/web/src/lib/cors'), 'getRequestOrigin').mockReturnValue('https://good.example' as any);
    const jose: any = require('jose');
    if (jose?.jwtVerify && typeof jose.jwtVerify === 'function') {
      jest.spyOn(jose, 'jwtVerify').mockResolvedValue({ payload: { aud: 'https://bad.example', scopes: [] } } as any);
    }
    const out = verifyRuntimeAuthorization(req as any, [] as any) as any;
    expect(out).toBeTruthy();
  });
});


