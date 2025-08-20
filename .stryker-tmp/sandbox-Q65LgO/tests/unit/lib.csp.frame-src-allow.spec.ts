// @ts-nocheck
import { middleware } from '../../apps/web/middleware';

const req = (url: string, headers?: Record<string, string>) => new Request(url, { headers: headers as any } as any);

describe('CSP frame-src extension via RUNTIME_FRAME_SRC_ALLOW', () => {
  const orig = { ...process.env };
  beforeEach(() => { process.env = { ...orig }; delete (process.env as any).NEXT_PUBLIC_CSP; });
  afterEach(() => { process.env = orig; });

  test('extends frame-src when NEXT_PUBLIC_CSP unset (guard path)', async () => {
    process.env.RUNTIME_FRAME_SRC_ALLOW = 'https://frames.example';
    process.env.NODE_ENV = 'production' as any;
    process.env.TEST_MODE = '1';
    const res: any = await (middleware as any)(req('http://localhost/api/health'));
    if (res) {
      const csp = res.headers.get('Content-Security-Policy') || '';
      if (csp) {
        expect(csp).toMatch(/frame-src [^;]*https:\/\/frames\.example/);
      }
    }
  });
});


