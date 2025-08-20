import * as supa from '../../apps/web/src/lib/supabaseServer';
import { GET as MetricsGET } from '../../apps/web/src/app/api/admin/metrics/route';
import { recordTiming, recordError } from '@/lib/metrics';

const get = (url: string, headers?: Record<string, string>) => new Request(url, { method: 'GET', headers });

describe('Admin metrics API', () => {
  beforeEach(() => { jest.restoreAllMocks(); });

  test('401/403 and 200 snapshot', async () => {
    let res = await (MetricsGET as any)(get('http://localhost/api/admin/metrics'));
    expect(res.status).toBe(401);

    jest.spyOn(supa, 'getCurrentUserInRoute').mockResolvedValue({ id: 'u', user_metadata: { role: 'teacher' } } as any);
    res = await (MetricsGET as any)(get('http://localhost/api/admin/metrics'));
    expect(res.status).toBe(403);

    recordTiming('/api/x', 10); recordTiming('/api/x', 20); recordError('/api/x');
    jest.spyOn(supa, 'getCurrentUserInRoute').mockResolvedValue({ id: 'a', user_metadata: { role: 'admin' } } as any);
    res = await (MetricsGET as any)(get('http://localhost/api/admin/metrics'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.timings?.['/api/x']?.count).toBeGreaterThanOrEqual(2);
  });
});


