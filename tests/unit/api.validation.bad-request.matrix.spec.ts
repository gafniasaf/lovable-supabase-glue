import { GET as AssignGET } from '../../apps/web/src/app/api/assignments/route';
import { GET as QuizzesGET } from '../../apps/web/src/app/api/quizzes/route';
import { GET as QqGET } from '../../apps/web/src/app/api/quiz-questions/route';
import { GET as MsgGET } from '../../apps/web/src/app/api/messages/route';
import { POST as ParentPOST } from '../../apps/web/src/app/api/parent-links/route';
import { POST as UploadPOST } from '../../apps/web/src/app/api/files/upload-url/route';
import { GET as DownloadGET } from '../../apps/web/src/app/api/files/download-url/route';
import { POST as ResolvePOST } from '../../apps/web/src/app/api/files/resolve/route';
import { GET as EngageGET } from '../../apps/web/src/app/api/reports/engagement/route';
import { GET as VersionsGET } from '../../apps/web/src/app/api/registry/versions/route';

const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);
const post = (url: string, body: any, headers?: Record<string,string>) => new Request(url, { method: 'POST', headers: { 'content-type': 'application/json', ...(headers||{}) } as any, body: JSON.stringify(body) } as any);

describe('validation bad-request matrix', () => {
  test('assignments invalid course_id → 400/401', async () => {
    const res = await (AssignGET as any)(get('http://localhost/api/assignments?course_id=not-a-uuid'));
    expect([400,401]).toContain(res.status);
  });

  test('quizzes invalid course_id → 400/401', async () => {
    const res = await (QuizzesGET as any)(get('http://localhost/api/quizzes?course_id=bad'));
    expect([400,401]).toContain(res.status);
  });

  test('quiz-questions invalid quiz_id → 400/401', async () => {
    const res = await (QqGET as any)(get('http://localhost/api/quiz-questions?quiz_id=bad'));
    expect([400,401]).toContain(res.status);
  });

  test('messages invalid thread_id → 400/401', async () => {
    const res = await (MsgGET as any)(get('http://localhost/api/messages?thread_id=bad'));
    expect([400,401]).toContain(res.status);
  });

  test('parent-links missing fields → 400/401', async () => {
    const res = await (ParentPOST as any)(post('http://localhost/api/parent-links', {}));
    expect([400,401]).toContain(res.status);
  });

  test('upload-url missing content_type → 400/401', async () => {
    const res = await (UploadPOST as any)(post('http://localhost/api/files/upload-url', { owner_type: 'user', owner_id: 'u' }));
    expect([400,401]).toContain(res.status);
  });

  test('download-url missing id → 400/401', async () => {
    const res = await (DownloadGET as any)(get('http://localhost/api/files/download-url'));
    expect([400,401]).toContain(res.status);
  });

  test('resolve missing keys in body → 400/401', async () => {
    const res = await (ResolvePOST as any)(post('http://localhost/api/files/resolve', {}));
    expect([400,401]).toContain(res.status);
  });

  test('engagement missing course_id → 400/401', async () => {
    const res = await (EngageGET as any)(get('http://localhost/api/reports/engagement'));
    expect([400,401]).toContain(res.status);
  });

  test('registry versions missing external_course_id → 400/401/403', async () => {
    const res = await (VersionsGET as any)(get('http://localhost/api/registry/versions'));
    expect([400,401,403]).toContain(res.status);
  });
});


