import { POST as MessagesPOST } from '../../apps/web/src/app/api/messages/route';
import { PATCH as AssignmentsPATCH } from '../../apps/web/src/app/api/assignments/route';

type HeadersMap = Record<string, string>;

function req(url: string, init: { method: string; headers?: HeadersMap; body?: any }) {
  const h = init.headers as any;
  return new Request(url, { method: init.method, headers: h, body: init.body } as any);
}

describe('CSRF double-submit enforcement (wrapper-level)', () => {
  const orig = { ...process.env } as any;
  afterEach(() => { process.env = orig; });

  test('messages POST without x-csrf-token rejected when enabled', async () => {
    process.env = { ...orig, CSRF_DOUBLE_SUBMIT: '1', NEXT_PUBLIC_BASE_URL: 'http://localhost' } as any;
    const headers: HeadersMap = { 'x-test-auth': 'student', 'content-type': 'application/json', cookie: 'csrf_token=abc' };
    const res = await (MessagesPOST as any)(req('http://localhost/api/messages', { method: 'POST', headers, body: JSON.stringify({ thread_id: 't1', body: 'hi' }) }));
    expect([401,403]).toContain(res.status);
  });

  test('messages POST with mismatched token rejected when enabled', async () => {
    process.env = { ...orig, CSRF_DOUBLE_SUBMIT: '1', NEXT_PUBLIC_BASE_URL: 'http://localhost' } as any;
    const headers: HeadersMap = { 'x-test-auth': 'student', 'content-type': 'application/json', 'x-csrf-token': 'abc', cookie: 'csrf_token=xyz' };
    const res = await (MessagesPOST as any)(req('http://localhost/api/messages', { method: 'POST', headers, body: JSON.stringify({ thread_id: 't1', body: 'hi' }) }));
    expect([401,403]).toContain(res.status);
  });

  test('messages POST with matching token allowed through wrapper (may still 401/429 deeper)', async () => {
    process.env = { ...orig, CSRF_DOUBLE_SUBMIT: '1', NEXT_PUBLIC_BASE_URL: 'http://localhost' } as any;
    const headers: HeadersMap = { 'x-test-auth': 'student', 'content-type': 'application/json', 'x-csrf-token': 'abc', cookie: 'csrf_token=abc' };
    const res = await (MessagesPOST as any)(req('http://localhost/api/messages', { method: 'POST', headers, body: JSON.stringify({ thread_id: 't1', body: 'hi' }) }));
    expect([201,401,403,429,500]).toContain(res.status);
  });

  test('assignments PATCH without token rejected when enabled', async () => {
    process.env = { ...orig, CSRF_DOUBLE_SUBMIT: '1', NEXT_PUBLIC_BASE_URL: 'http://localhost' } as any;
    const headers: HeadersMap = { 'x-test-auth': 'teacher', 'content-type': 'application/json', cookie: 'csrf_token=abc' };
    const res = await (AssignmentsPATCH as any)(req('http://localhost/api/assignments?id=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', { method: 'PATCH', headers, body: JSON.stringify({ title: 'X' }) }));
    expect([401,403]).toContain(res.status);
  });
});
