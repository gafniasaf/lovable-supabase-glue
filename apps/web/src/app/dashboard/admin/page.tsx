import Link from "next/link";
import { createDashboardGateway } from "@/lib/data/dashboard";
import { dashboardResponse } from "@education/shared";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Trans from "@/lib/i18n/Trans";

export default async function AdminDashboardPage() {
  const json = await createDashboardGateway().get().catch(() => null as any);
  if (!json) {
    return (
      <section className="p-6" aria-label="Admin dashboard">
        <p><Trans keyPath="auth.notSignedIn" fallback="You are not signed in." /> <Link className="underline" href="/login"><Trans keyPath="auth.signin" fallback="Sign in" /></Link></p>
      </section>
    );
  }
  const parsed = dashboardResponse.safeParse(json);
  const data = parsed.success && parsed.data.role === 'admin' ? parsed.data.data : null;
  return (
    <section className="p-6 space-y-4" aria-label="Admin dashboard">
      <Breadcrumbs items={[{ label: "Dashboard" }]} />
      <h1 className="text-xl font-semibold"><Trans keyPath="dashboard.admin" fallback="Admin dashboard" /></h1>
      {/* Saved views + quick filters */}
      <div className="flex items-center gap-3">
        <details>
          <summary className="underline cursor-pointer select-none">Quick filters</summary>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <button className="border rounded px-2 py-1">Active</button>
            <button className="border rounded px-2 py-1">Suspended</button>
            <button className="border rounded px-2 py-1">Teachers</button>
            <button className="border rounded px-2 py-1">Students</button>
          </div>
        </details>
        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm">Saved views</label>
          <select className="border rounded p-1 text-sm" defaultValue="default">
            <option value="default">Default</option>
            <option value="ops">Ops: health & flags</option>
            <option value="users">Users by role</option>
          </select>
          <button className="underline text-sm" title="Save current filters">★ Save view</button>
        </div>
      </div>
      {!data && (
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4" data-testid="admin-kpis-skeleton">
          <div className="border rounded p-4">
            <div className="skeleton h-4 w-24 mb-2" />
            <div className="skeleton h-8 w-16" />
          </div>
          <div className="border rounded p-4">
            <div className="skeleton h-4 w-24 mb-2" />
            <div className="skeleton h-8 w-16" />
          </div>
          <div className="border rounded p-4">
            <div className="skeleton h-4 w-24 mb-2" />
            <div className="skeleton h-8 w-16" />
          </div>
        </section>
      )}
      {data && (
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4" data-testid="admin-kpis">
          <KPICard label="Total users" value={data.kpis.totalUsers.value} />
          <KPICard label="Total courses" value={data.kpis.totalCourses.value} />
          <KPICard label="DAU" value={data.kpis.dailyActiveUsers.value} />
        </section>
      )}
      <section className="border rounded p-4">
        <h2 className="font-medium mb-2">Profile</h2>
        <ul className="list-disc ml-6 text-sm">
          <li><Link className="underline" href="/dashboard/admin/profile">Edit profile</Link></li>
        </ul>
      </section>
      <section className="border rounded p-4">
        <h2 className="font-medium mb-2">Integrations</h2>
        <ul className="list-disc ml-6 text-sm">
          <li><Link className="underline" href="/admin/providers">Course providers</Link></li>
          <li><Link className="underline" href="/admin/catalog">Course catalog</Link></li>
          <li><Link className="underline" href="/admin/versions">Course versions</Link></li>
        </ul>
      </section>
      <section className="border rounded p-4">
        <h2 className="font-medium mb-2">Security & Audit</h2>
        <ul className="list-disc ml-6 text-sm">
          <li><Link className="underline" href="/dashboard/admin/audit">Audit logs</Link></li>
          <li><Link className="underline" href="/dashboard/admin/flags">Feature flags</Link></li>
        </ul>
      </section>
      <section className="border rounded p-4">
        <h2 className="font-medium mb-2">Users & Roles</h2>
        <ul className="list-disc ml-6 text-sm">
          <li><Link className="underline" href="/dashboard/admin/users">Users</Link></li>
          <li><Link className="underline" href="/dashboard/admin/roles">Roles</Link></li>
        </ul>
      </section>
      <section className="border rounded p-4">
        <h2 className="font-medium mb-2">Operations</h2>
        <ul className="list-disc ml-6 text-sm">
          <li><Link className="underline" href="/dashboard/admin/health">System health</Link></li>
          <li><Link className="underline" href="/dashboard/admin/reports">Reports</Link></li>
          <li><Link className="underline" href="/dashboard/admin/metrics">Metrics</Link></li>
          <li><Link className="underline" href="/dashboard/admin/quotas">Storage quotas</Link></li>
          <li><Link className="underline" href="/dashboard/admin/dlq">Dead Letters</Link></li>
          <li><Link className="underline" href="/dashboard/admin/usage">Usage Counters</Link></li>
          <li><Link className="underline" href="/dashboard/admin/licenses">Licenses</Link></li>
        </ul>
      </section>
      {data?.recentActivity?.length ? (
        <section className="border rounded p-4">
          <h2 className="font-medium mb-2">Recent activity</h2>
          <ul className="text-sm space-y-1">
            {data.recentActivity.slice(0,10).map((a: any) => (
              <li key={a.id} className="flex items-center justify-between">
                <span>{a.message}</span>
                <span className="text-gray-500">{new Date(a.at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <section className="border rounded p-4" data-testid="admin-metrics">
        <div className="text-gray-600">Metrics coming soon…</div>
      </section>
    </section>
  );
}

function KPICard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border rounded p-4">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}


