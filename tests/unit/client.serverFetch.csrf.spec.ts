import { serverFetch } from '../../apps/web/src/lib/serverFetch';

describe('serverFetch CSRF header attachment', () => {
  const orig = { ...process.env } as any;
  afterEach(() => { process.env = orig; });

  test('attaches x-csrf-token for unsafe methods when cookie present', async () => {
    process.env = { ...orig, CSRF_DOUBLE_SUBMIT: '1', TEST_MODE: '1' } as any;
    // Set a global test headers store that mimics next/headers cookies in serverFetch
    (global as any).__TEST_HEADERS_STORE__ = true;
    // Monkey-patch fetch to capture headers and return a stub response
    const origFetch = global.fetch as any;
    let captured: any = null;
    (global as any).fetch = async (url: any, init: any) => {
      captured = init?.headers;
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } });
    };
    try {
      // Simulate cookie via document for client path or via header store in server path; here we force Test Mode path uses direct fetch
      Object.defineProperty(global, 'document', { value: { cookie: 'csrf_token=abc' }, configurable: true });
      await serverFetch('/api/messages', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({}) });
      expect(captured && typeof captured.get === 'function' ? captured.get('x-csrf-token') : captured['x-csrf-token']).toBe('abc');
    } finally {
      (global as any).fetch = origFetch;
    }
  });
});
