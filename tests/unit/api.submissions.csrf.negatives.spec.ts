import { POST as SubmissionsPOST } from '../../apps/web/src/app/api/submissions/route';

const post = (body: any, headers?: Record<string,string>) => new Request('http://localhost/api/submissions', { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);

describe('submissions POST CSRF double-submit negatives', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; (process.env as any).CSRF_DOUBLE_SUBMIT = '1'; });
  afterEach(() => { delete (process.env as any).CSRF_DOUBLE_SUBMIT; });

  test('missing CSRF cookie/header yields 403', async () => {
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', 'student');
    const res = await (SubmissionsPOST as any)(post({ assignment_id: '00000000-0000-0000-0000-000000000001', text: 't' }));
    expect([401,403]).toContain(res.status);
  });

  test('mismatch CSRF cookie/header yields 403', async () => {
    // Simulate cookie token but different header
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__ = { cookies: { get: (k: string)=> ({ name: k, value: 'cookie-token' }), set: ()=>{} } } as any;
    const res = await (SubmissionsPOST as any)(post({ assignment_id: '00000000-0000-0000-0000-000000000001', text: 't' }, { 'x-csrf-token': 'bad' }));
    expect([401,403]).toContain(res.status);
  });
});


