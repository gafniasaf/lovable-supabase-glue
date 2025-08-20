// @ts-nocheck
import { getCurrentUser } from "@/lib/supabaseServer";
import { createGradingGateway } from "@/lib/data/grading";
import Link from "next/link";
import { headers, cookies } from "next/headers";
import { dashboardResponse } from "@education/shared";
import { createNotificationsGateway } from "@/lib/data/notifications";
import { createDashboardGateway } from "@/lib/data/dashboard";
import { createInteractiveOutcomesGateway } from "@/lib/data/interactiveOutcomes";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Trans from "@/lib/i18n/Trans";

export default async function TeacherDashboard() {
  const user = await getCurrentUser();
  if (!user) return <section className="p-6" aria-label="Teacher dashboard"><h1 className="text-xl font-semibold"><Trans keyPath="dashboard.teacher" fallback="Your courses" /></h1><p><Trans keyPath="auth.notSignedIn" fallback="You are not signed in." /> <a className="underline" href="/login"><Trans keyPath="auth.signin" fallback="Sign in" /></a></p></section>;
  const h = headers();
  const c = cookies();
  const dashJson = await createDashboardGateway().get().catch(() => ({} as any));
  const parsed = dashboardResponse.safeParse(dashJson);
  const data = parsed.success && parsed.data.role === 'teacher' ? parsed.data.data : null;

  // Fetch notifications (test-mode / SSR-friendly)
  const notifications: any[] = await createNotificationsGateway().list(0, 100).catch(() => []);
  const ia: any[] = await createInteractiveOutcomesGateway().listRecentForTeacher().catch(() => []);

  let quickLink: string | null = null;
  try {
    const { rows } = await createGradingGateway().listUngraded({ page: 1, limit: 1 });
    const r: any | undefined = (rows || [])[0];
    if (r && r.assignment_id) quickLink = `/dashboard/teacher/${r.course_id ?? ''}/assignments/${r.assignment_id}/submissions`;
  } catch {}
  return (
    <section className="p-6" aria-label="Teacher dashboard">
      <Breadcrumbs items={[{ label: "Dashboard" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold"><Trans keyPath="dashboard.teacher" fallback="Your courses" /></h1>
        <div className="flex items-center gap-3">
          <Link className="underline" href="/dashboard/teacher/profile">Edit profile</Link>
          <Link className="underline" href="/dashboard/teacher/new">New course</Link>
        </div>
      </div>
      {data ? (
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div className="border rounded p-4">
            <div className="text-sm text-gray-600">Active courses</div>
            <div className="text-2xl font-semibold">{data.kpis.activeCourses.value}</div>
          </div>
          <div className="border rounded p-4">
            <div className="text-sm text-gray-600">Students</div>
            <div className="text-2xl font-semibold">{data.kpis.studentsEnrolled.value}</div>
          </div>
          <div className="border rounded p-4">
            <div className="text-sm text-gray-600">Needs grading</div>
            <div className="text-2xl font-semibold flex items-baseline gap-2">
              <span>{data.kpis.needsGrading?.value ?? 0}</span>
              <Link className="underline text-sm" href="/dashboard/teacher/grading-queue">Open grading queue</Link>
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Estimated across your courses
            </div>
            {quickLink ? (
              <div className="mt-2">
                <Link className="underline text-sm" href={{ pathname: quickLink }}>Grade next →</Link>
              </div>
            ) : null}
          </div>
          <div className="border rounded p-4">
            <div className="text-sm text-gray-600">Interactive attempts (24h)</div>
            <div className="text-2xl font-semibold">{data.kpis.interactiveAttempts?.value ?? 0}</div>
          </div>
          <div className="border rounded p-4">
            <div className="text-sm text-gray-600">Interactive pass % (24h)</div>
            <div className="text-2xl font-semibold">{data.kpis.interactivePassRate?.value ?? 0}%</div>
          </div>
        </section>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div className="border rounded p-4"><div className="skeleton h-4 w-24 mb-2" /><div className="skeleton h-8 w-16" /></div>
          <div className="border rounded p-4"><div className="skeleton h-4 w-24 mb-2" /><div className="skeleton h-8 w-16" /></div>
          <div className="border rounded p-4"><div className="skeleton h-4 w-24 mb-2" /><div className="skeleton h-8 w-16" /></div>
        </section>
      )}
      <section className="mt-4">
        <h2 className="font-medium">Notifications</h2>
        {notifications.length === 0 ? (
          <div className="text-gray-500">No notifications</div>
        ) : (
          <ul className="mt-2 space-y-1">
            {notifications.slice(0,5).map((n: any) => (
              <li key={n.id} className="text-sm">
                <span className="font-medium">{n.type}</span>
                <span className="ml-2 text-gray-600">{new Date(n.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="mt-4">
        <h2 className="font-medium">Recent interactive attempts</h2>
        {ia.length === 0 ? (
          <div className="text-gray-500">No recent attempts</div>
        ) : (
          <ul className="mt-2 space-y-1">
            {ia.slice(0,5).map((r: any) => (
              <li key={r.id} className="text-sm flex items-center justify-between">
                <span className="font-mono text-xs">{r.user_id}</span>
                <span className="text-gray-600">{r.score != null ? `${r.score}/${r.max}` : (r.pct != null ? `${r.pct}%` : '-')}</span>
                <span className="text-gray-500">{new Date(r.created_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      {data ? (
        <ul className="mt-4 space-y-3">
          {(data.recentCourses ?? []).map(c => (
            <li key={c.id} className="border rounded p-3">
              <Link className="font-medium underline" href={`/dashboard/teacher/${c.id}`}>{c.title}</Link>
              <div className="text-gray-600 text-sm">Created {new Date(c.createdAt).toLocaleDateString()}</div>
            </li>
          ))}
          {(!data.recentCourses || data.recentCourses.length === 0) && <li className="text-gray-500">No courses yet.</li>}
        </ul>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="skeleton h-16 w-full" />
          <div className="skeleton h-16 w-full" />
        </div>
      )}
    </section>
  );
}


