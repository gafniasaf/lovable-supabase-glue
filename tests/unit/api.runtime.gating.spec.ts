import { GET as ContextGET } from '../../apps/web/src/app/api/runtime/context/route';
import { POST as ProgressPOST } from '../../apps/web/src/app/api/runtime/progress/route';
import { POST as GradePOST } from '../../apps/web/src/app/api/runtime/grade/route';
import { POST as EventsPOST } from '../../apps/web/src/app/api/runtime/events/route';
import { GET as CkptLoadGET } from '../../apps/web/src/app/api/runtime/checkpoint/load/route';
import { POST as CkptSavePOST } from '../../apps/web/src/app/api/runtime/checkpoint/save/route';

const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: { origin: 'https://provider.example', ...(headers||{}) } as any } as any);

function post(url: string, headers?: Record<string,string>, body?: any) { return new Request(url, { method: 'POST', headers: headers as any, body: JSON.stringify(body || {}) } as any); }

describe('runtime v2 gating (RUNTIME_API_V2)', () => {
  const orig = { ...process.env } as any;
  afterEach(() => { process.env = orig; });

  test('returns 403 when disabled', async () => {
    process.env = { ...orig, RUNTIME_API_V2: '0' } as any;
    const res = await (ProgressPOST as any)(post('http://localhost/api/runtime/progress', { authorization: 'Bearer t', origin: 'http://localhost' } as any, { pct: 10 }));
    expect([403,401]).toContain(res.status);
  });

  test('context/grade/events/checkpoints respect gate', async () => {
    process.env = { ...orig, RUNTIME_API_V2: '0' } as any;
    const badCtx = await (ContextGET as any)(get('http://localhost/api/runtime/context'));
    const badGrade = await (GradePOST as any)(post('http://localhost/api/runtime/grade', { authorization: 'Bearer t', origin: 'http://localhost' } as any, { score: 1, max: 1, passed: true }));
    const badEvents = await (EventsPOST as any)(post('http://localhost/api/runtime/events', { authorization: 'Bearer t', origin: 'http://localhost' } as any, { type: 'course.progress', pct: 1 }));
    const badLoad = await (CkptLoadGET as any)(get('http://localhost/api/runtime/checkpoint/load?key=x'));
    const badSave = await (CkptSavePOST as any)(post('http://localhost/api/runtime/checkpoint/save', { authorization: 'Bearer t', origin: 'http://localhost' } as any, { key: 'x', state: {} }));
    expect([403,401]).toContain(badCtx.status);
    expect([403,401]).toContain(badGrade.status);
    expect([403,401]).toContain(badEvents.status);
    expect([403,401]).toContain(badLoad.status);
    expect([403,401]).toContain(badSave.status);
  });
});


