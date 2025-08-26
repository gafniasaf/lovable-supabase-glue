import Link from "next/link";
import { createDashboardGateway } from "@/lib/data/dashboard";
import { dashboardResponse } from "@education/shared";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Trans from "@/lib/i18n/Trans";
import AdminDashboard from "@/ui/v0/AdminDashboard";

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
  const kpis = data ? [
    { id: 'users', label: 'Total users', value: data.kpis.totalUsers.value },
    { id: 'courses', label: 'Total courses', value: data.kpis.totalCourses.value },
    { id: 'dau', label: 'DAU', value: data.kpis.dailyActiveUsers.value }
  ] : [];
  const sections = [
    { id: 'profile', title: 'Profile', links: [{ label: 'Edit profile', href: '/dashboard/admin/profile' }] },
    { id: 'integrations', title: 'Integrations', links: [
      { label: 'Course providers', href: '/admin/providers' },
      { label: 'Course catalog', href: '/admin/catalog' },
      { label: 'Course versions', href: '/admin/versions' }
    ]},
    { id: 'security', title: 'Security & Audit', links: [
      { label: 'Audit logs', href: '/dashboard/admin/audit' },
      { label: 'Feature flags', href: '/dashboard/admin/flags' }
    ]},
    { id: 'users_roles', title: 'Users & Roles', links: [
      { label: 'Users', href: '/dashboard/admin/users' },
      { label: 'Roles', href: '/dashboard/admin/roles' }
    ]},
    { id: 'ops', title: 'Operations', links: [
      { label: 'System health', href: '/dashboard/admin/health' },
      { label: 'Reports', href: '/dashboard/admin/reports' },
      { label: 'Metrics', href: '/dashboard/admin/metrics' },
      { label: 'Storage quotas', href: '/dashboard/admin/quotas' },
      { label: 'Dead Letters', href: '/dashboard/admin/dlq' },
      { label: 'Usage Counters', href: '/dashboard/admin/usage' },
      { label: 'Licenses', href: '/dashboard/admin/licenses' }
    ]}
  ];
  const recent = (data?.recentActivity || []).slice(0, 10).map((a: any) => ({ id: a.id, message: a.message, at: new Date(a.at).toISOString() }));
  return (
    <section className="p-6 space-y-4" aria-label="Admin dashboard">
      <Breadcrumbs items={[{ label: "Dashboard" }]} />
      <AdminDashboard kpis={kpis as any} sections={sections} recent={recent as any} />
    </section>
  );
}


