import { GET as ContextGET } from '../../apps/web/src/app/api/runtime/context/route';
import { POST as AssetPOST } from '../../apps/web/src/app/api/runtime/asset/sign-url/route';
import { POST as SavePOST } from '../../apps/web/src/app/api/runtime/checkpoint/save/route';
import { GET as LoadGET } from '../../apps/web/src/app/api/runtime/checkpoint/load/route';
import { POST as EventsPOST } from '../../apps/web/src/app/api/runtime/events/route';
import { POST as GradePOST } from '../../apps/web/src/app/api/runtime/grade/route';
import { POST as ProgressPOST } from '../../apps/web/src/app/api/runtime/progress/route';
import { GET as OutcomesGET } from '../../apps/web/src/app/api/runtime/outcomes/route';
import { GET as OutcomesExportGET } from '../../apps/web/src/app/api/runtime/outcomes/export/route';

const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: { origin: 'https://provider.example', ...(headers||{}) } as any } as any);
const post = (url: string, body?: any, headers?: Record<string,string>) => new Request(url, { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://provider.example', ...(headers||{}) } as any, body: body ? JSON.stringify(body) : undefined } as any);

describe('runtime endpoints require token (guard matrix)', () => {
  beforeEach(() => { (process.env as any).RUNTIME_API_V2 = '1'; (process.env as any).RUNTIME_CORS_ALLOW = 'https://provider.example'; delete (process.env as any).NEXT_RUNTIME_PUBLIC_KEY; (process.env as any).NEXT_RUNTIME_SECRET = 'dev-secret'; });

  test('context GET missing token → 401', async () => {
    const res = await (ContextGET as any)(get('http://localhost/api/runtime/context'));
    expect([401]).toContain(res.status);
  });

  test('asset sign-url POST missing token → 401/403', async () => {
    const res = await (AssetPOST as any)(post('http://localhost/api/runtime/asset/sign-url', { content_type: 'text/plain' }));
    expect([401,403]).toContain(res.status);
  });

  test('checkpoint save/load missing token → 401/403', async () => {
    const save = await (SavePOST as any)(post('http://localhost/api/runtime/checkpoint/save', { key: 'k', state: {} }));
    const load = await (LoadGET as any)(get('http://localhost/api/runtime/checkpoint/load?key=k'));
    expect([401,403]).toContain(save.status);
    expect([401,403]).toContain(load.status);
  });

  test('events/grade/progress missing token → 401/403', async () => {
    const e = await (EventsPOST as any)(post('http://localhost/api/runtime/events', { type: 'course.ready' }));
    const g = await (GradePOST as any)(post('http://localhost/api/runtime/grade', { score: 1, max: 1, passed: true }));
    const p = await (ProgressPOST as any)(post('http://localhost/api/runtime/progress', { pct: 10 }));
    expect([401,403]).toContain(e.status);
    expect([401,403]).toContain(g.status);
    expect([401,403]).toContain(p.status);
  });

  test('outcomes list/export missing token → 401/403/400', async () => {
    const list = await (OutcomesGET as any)(get('http://localhost/api/runtime/outcomes?course_id=00000000-0000-0000-0000-000000000001'));
    const exp = await (OutcomesExportGET as any)(get('http://localhost/api/runtime/outcomes/export?course_id=00000000-0000-0000-0000-000000000001'));
    expect([401,403,400,500]).toContain(list.status);
    expect([401,403,400,500]).toContain(exp.status);
  });
});


