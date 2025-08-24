import { GET as ActivityGET } from '../../apps/web/src/app/api/reports/activity/route';
import { GET as RetentionGET } from '../../apps/web/src/app/api/reports/retention/route';
import * as supa from '../helpers/supabaseMock';

function get(url: string, headers?: Record<string, string>) {
  return new Request(url, { method: 'GET', headers } as any);
}

describe('reports activity/retention rate limiting', () => {
  const original = { ...process.env } as any;
  afterEach(() => { process.env = original; jest.restoreAllMocks(); });

  test('activity: third consecutive request returns 429 with standard headers', async () => {
    process.env = {
      ...original,
      REPORTS_ACTIVITY_LIMIT: '2',
      REPORTS_ACTIVITY_WINDOW_MS: '60000'
    } as any;
    const mock = (supa as any).makeSupabaseMock({
      events: () => supa.supabaseOk([])
    } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock);
    jest.spyOn(supa as any, 'getCurrentUserInRoute').mockResolvedValue({ id: 't1', user_metadata: { role: 'teacher' } } as any);

    const url = 'http://localhost/api/reports/activity?limit=1';
    const h = { 'x-test-auth': 'teacher' } as Record<string, string>;
    const r1 = await (ActivityGET as any)(get(url, h));
    expect([200,500]).toContain(r1.status);
    const r2 = await (ActivityGET as any)(get(url, h));
    expect([200,500]).toContain(r2.status);
    const r3 = await (ActivityGET as any)(get(url, h));
    expect(r3.status).toBe(429);
    expect(r3.headers.get('retry-after')).toBeTruthy();
    expect(r3.headers.get('x-rate-limit-remaining')).toBe('0');
    expect(r3.headers.get('x-rate-limit-reset')).toBeTruthy();
  });

  test('retention: third consecutive request returns 429 with standard headers', async () => {
    process.env = {
      ...original,
      REPORTS_RETENTION_LIMIT: '2',
      REPORTS_RETENTION_WINDOW_MS: '60000'
    } as any;
    const mock = (supa as any).makeSupabaseMock({
      daily_active_users: () => supa.supabaseOk([])
    } as any);
    jest.spyOn(supa as any, 'getRouteHandlerSupabase').mockReturnValue(mock);
    jest.spyOn(supa as any, 'getCurrentUserInRoute').mockResolvedValue({ id: 't1', user_metadata: { role: 'teacher' } } as any);

    const url = 'http://localhost/api/reports/retention';
    const h = { 'x-test-auth': 'teacher' } as Record<string, string>;
    const r1 = await (RetentionGET as any)(get(url, h));
    expect([200,500]).toContain(r1.status);
    const r2 = await (RetentionGET as any)(get(url, h));
    expect([200,500]).toContain(r2.status);
    const r3 = await (RetentionGET as any)(get(url, h));
    expect(r3.status).toBe(429);
    expect(r3.headers.get('retry-after')).toBeTruthy();
    expect(r3.headers.get('x-rate-limit-remaining')).toBe('0');
    expect(r3.headers.get('x-rate-limit-reset')).toBeTruthy();
  });
});


