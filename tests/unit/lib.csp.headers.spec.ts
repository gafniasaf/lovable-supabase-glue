import { buildDefaultCsp } from '../../apps/web/src/lib/csp';

describe('CSP builder', () => {
  test('includes nonce and allowed connect-src', () => {
    (process.env as any).RUNTIME_CORS_ALLOW = 'https://p1.example,https://p2.example';
    const nonce = 'abc123';
    const csp = buildDefaultCsp(nonce);
    expect(csp).toMatch(/script-src 'self' 'nonce-abc123'/);
    expect(csp).toMatch(/connect-src self https:\/\/p1\.example https:\/\/p2\.example/);
  });
});


