// @ts-nocheck
import { middleware } from '../../apps/web/middleware';

function req(url: string, headers?: Record<string, string>) {
  return new Request(url, { headers: headers as any } as any);
}

describe('middleware headers behavior', () => {
  const originalEnv = { ...process.env };
  beforeEach(() => { jest.resetModules(); process.env = { ...originalEnv }; });
  afterEach(() => { process.env = originalEnv; });

  test('adds x-request-id if missing via a guard response path', async () => {
    // Force a guard path that returns NextResponse.json instead of NextResponse.next
    process.env.NODE_ENV = 'production' as any;
    process.env.TEST_MODE = '1';
    const res: any = await (middleware as any)(req('http://localhost/api/health'));
    expect(res).toBeTruthy();
    expect(res.headers.get('x-request-id')).toBeTruthy();
  });

  test('echoes upstream x-request-id on forbidden x-test-auth path', async () => {
    delete (process.env as any).TEST_MODE; // not in test mode => x-test-auth is forbidden
    const res: any = await (middleware as any)(req('http://localhost/api/health', { 'x-test-auth': 'teacher', 'x-request-id': 'rq-mid-123' }));
    expect(res).toBeTruthy();
    expect(res.headers.get('x-request-id')).toBe('rq-mid-123');
  });
});


