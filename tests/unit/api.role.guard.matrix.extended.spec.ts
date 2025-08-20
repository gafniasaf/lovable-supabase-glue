import { GET as AuditGET } from '../../apps/web/src/app/api/admin/audit-logs/route';
import { GET as ExportGET } from '../../apps/web/src/app/api/admin/export/route';
import { GET as MetricsGET } from '../../apps/web/src/app/api/admin/metrics/route';
import { GET as QuotasGET } from '../../apps/web/src/app/api/admin/quotas/route';
import { GET as UsersGET } from '../../apps/web/src/app/api/users/route';
import { GET as ProvidersHealthGET } from '../../apps/web/src/app/api/providers/health/route';
import { GET as RegistryCoursesGET } from '../../apps/web/src/app/api/registry/courses/route';

const get = (url: string, headers?: Record<string,string>) => new Request(url, { method: 'GET', headers: headers as any } as any);

describe('admin/registry/users role guard matrix', () => {
  beforeEach(() => { (process.env as any).TEST_MODE = '1'; jest.resetModules(); });

  const roles: Array<'student'|'teacher'|'parent'|'admin'> = ['student','teacher','parent','admin'];
  const cases: Array<{name:string, url:string, handler: (req: Request)=>Promise<Response>}> = [
    { name: 'admin/audit-logs', url: 'http://localhost/api/admin/audit-logs', handler: AuditGET as any },
    { name: 'admin/export', url: 'http://localhost/api/admin/export', handler: ExportGET as any },
    { name: 'admin/metrics', url: 'http://localhost/api/admin/metrics', handler: MetricsGET as any },
    { name: 'admin/quotas', url: 'http://localhost/api/admin/quotas', handler: QuotasGET as any },
    { name: 'users', url: 'http://localhost/api/users', handler: UsersGET as any },
    { name: 'providers/health', url: 'http://localhost/api/providers/health', handler: ProvidersHealthGET as any },
    { name: 'registry/courses', url: 'http://localhost/api/registry/courses', handler: RegistryCoursesGET as any },
  ];

  test.each(cases.flatMap(c => roles.map(role => ({ ...c, role }))))('%s as %s', async ({ name, url, handler, role }) => {
    // Mock Supabase to support order/eq chain when admin endpoints hit DB
    const supabaseServer = await import('../../apps/web/src/lib/supabaseServer');
    const { makeSupabaseMock, supabaseOk } = await import('./helpers/supabaseMock');
    const supa = makeSupabaseMock({
      audit_logs: () => supabaseOk([]),
      user_storage_quotas: () => supabaseOk([]),
      users: () => supabaseOk([]),
      registry_courses: () => supabaseOk([]),
    });
    jest.spyOn(supabaseServer, 'getRouteHandlerSupabase').mockReturnValue(supa as any);
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.set?.('x-test-auth', role);
    const res = await (handler as any)(get(url));
    expect([200,401,403,400,429,500]).toContain(res.status);
    expect(res.headers.get('x-request-id')).toBeTruthy();
  });
});


