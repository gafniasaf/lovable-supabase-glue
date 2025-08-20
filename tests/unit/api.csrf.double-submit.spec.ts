import { POST as MessagesPOST } from '../../apps/web/src/app/api/messages/route';
import { POST as FilesFinalizePOST } from '../../apps/web/src/app/api/files/finalize/route';

const post = (url: string, body: any, headers?: Record<string,string>) => new Request(url, { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);

describe('CSRF double-submit enforcement (when enabled)', () => {
  const originalEnv = { ...process.env } as any;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, TEST_MODE: '1', CSRF_DOUBLE_SUBMIT: '1' } as any;
    // @ts-ignore simulate auth in test-mode
    (globalThis as any).__TEST_HEADERS_STORE__ = (globalThis as any).__TEST_HEADERS_STORE__ || { headers: new Map(), cookies: new Map() };
    // @ts-ignore
    (globalThis as any).__TEST_HEADERS_STORE__.cookies.set('x-test-auth', 'teacher');
  });
  afterEach(() => { process.env = originalEnv; });

  test('messages POST: missing tokens → 403', async () => {
    const res = await (MessagesPOST as any)(post('http://localhost/api/messages', { thread_id: crypto.randomUUID(), body: 'hi' }, { 'x-test-auth': 'teacher' }));
    expect(res.status).toBe(403);
  });

  test('messages POST: mismatched tokens → 403', async () => {
    // @ts-ignore
    (globalThis as any).__TEST_HEADERS_STORE__.cookies.set('csrf_token', 'cookie-token');
    const res = await (MessagesPOST as any)(post('http://localhost/api/messages', { thread_id: crypto.randomUUID(), body: 'hi' }, { 'x-test-auth': 'teacher', 'x-csrf-token': 'header-token' }));
    expect(res.status).toBe(403);
  });

  test('files finalize POST: missing tokens → 403', async () => {
    const res = await (FilesFinalizePOST as any)(post('http://localhost/api/files/finalize', { key: 'k', size_bytes: 1 }, { 'x-test-auth': 'teacher' }));
    expect(res.status).toBe(403);
  });
});


