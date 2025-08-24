import { OPTIONS as ProgressOPTIONS } from '../../apps/web/src/app/api/runtime/progress/route';
import { OPTIONS as GradeOPTIONS } from '../../apps/web/src/app/api/runtime/grade/route';
import { OPTIONS as EventsOPTIONS } from '../../apps/web/src/app/api/runtime/events/route';
import { OPTIONS as AssetOPTIONS } from '../../apps/web/src/app/api/runtime/asset/sign-url/route';
import { OPTIONS as CkptLoadOPTIONS } from '../../apps/web/src/app/api/runtime/checkpoint/load/route';
import { OPTIONS as OutcomesOPTIONS } from '../../apps/web/src/app/api/runtime/outcomes/route';

function opt(url: string, origin?: string) {
  const headers: Record<string,string> = {};
  if (origin) headers.origin = origin;
  return new Request(url, { method: 'OPTIONS', headers: headers as any } as any);
}

describe('runtime OPTIONS preflight vary header', () => {
  test('preflight returns 204 with vary Origin', async () => {
    const res = await (ProgressOPTIONS as any)(opt('http://localhost/api/runtime/progress', 'https://provider.example'));
    expect(res.status).toBe(204);
    expect(res.headers.get('vary')).toBe('Origin');
  });

  test('grade/events/asset/checkpoint/outcomes OPTIONS vary header', async () => {
    const grade = await (GradeOPTIONS as any)(opt('http://localhost/api/runtime/grade'));
    const ev = await (EventsOPTIONS as any)(opt('http://localhost/api/runtime/events'));
    const asset = await (AssetOPTIONS as any)(opt('http://localhost/api/runtime/asset/sign-url'));
    const load = await (CkptLoadOPTIONS as any)(opt('http://localhost/api/runtime/checkpoint/load?key=x'));
    const list = await (OutcomesOPTIONS as any)(opt('http://localhost/api/runtime/outcomes'));
    for (const r of [grade, ev, asset, load, list]) {
      expect(r.status).toBe(204);
      expect(r.headers.get('vary')).toBe('Origin');
    }
  });
});


