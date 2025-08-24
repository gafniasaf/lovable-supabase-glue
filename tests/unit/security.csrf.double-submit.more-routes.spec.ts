import { DELETE as AnnouncementsDELETE } from '../../apps/web/src/app/api/announcements/route';
import { POST as SubmissionsPOST } from '../../apps/web/src/app/api/submissions/route';

type H = Record<string,string>;
const req = (url: string, method: string, headers: H, body?: any) => new Request(url, { method, headers: headers as any, body: body ? JSON.stringify(body) : undefined } as any);

describe('CSRF double-submit enforcement (more routes)', () => {
  const orig = { ...process.env } as any;
  afterEach(() => { process.env = orig; });

  test('announcements DELETE without token rejected when enabled', async () => {
    process.env = { ...orig, CSRF_DOUBLE_SUBMIT: '1', NEXT_PUBLIC_BASE_URL: 'http://localhost' } as any;
    const headers: H = { 'x-test-auth': 'teacher' } as any;
    const res = await (AnnouncementsDELETE as any)(req('http://localhost/api/announcements?id=aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'DELETE', headers));
    expect([401,403]).toContain(res.status);
  });

  test('submissions POST without token rejected when enabled', async () => {
    process.env = { ...orig, CSRF_DOUBLE_SUBMIT: '1', NEXT_PUBLIC_BASE_URL: 'http://localhost' } as any;
    const headers: H = { 'x-test-auth': 'student', 'content-type': 'application/json' } as any;
    const res = await (SubmissionsPOST as any)(req('http://localhost/api/submissions', 'POST', headers, { assignment_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', text: 'hi' }));
    expect([401,403]).toContain(res.status);
  });
});
