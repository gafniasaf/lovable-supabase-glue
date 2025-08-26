import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createDashboardGateway } from "@/lib/data/dashboard";
import { dashboardResponse } from "@education/shared";
import { createNotificationsGateway } from "@/lib/data/notifications";
import { useNotificationsPoll } from "@/lib/hooks/useNotificationsPoll";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import NotifPoller from "@/app/dashboard/student/NotifPoller";
import Trans from "@/lib/i18n/Trans";
import StudentDashboardOverview from "@/ui/v0/StudentDashboardOverview";

export default async function StudentDashboardPage() {
  const json = await createDashboardGateway().get().catch(() => null as any);
  if (!json) {
    return (
      <section className="p-6" aria-label="Student dashboard">
        <p><Trans keyPath="auth.notSignedIn" fallback="You are not signed in." /> <Link className="underline" href="/login"><Trans keyPath="auth.signin" fallback="Sign in" /></Link></p>
      </section>
    );
  }
  const parsed = dashboardResponse.safeParse(json);
  const data = parsed.success && parsed.data.role === 'student' ? parsed.data.data : null;
  const notifications: any[] = await createNotificationsGateway().list(0, 100).catch(() => []);

  const notif = (notifications || []).slice(0, 10).map((n: any) => ({ id: n.id, type: n.type, at: new Date(n.created_at).toISOString(), href: n.type === 'message:new' && n.payload?.thread_id ? `/labs/system/inbox?thread=${encodeURIComponent(n.payload.thread_id)}` : undefined, extra: n.type === 'submission:graded' && n.payload?.score != null ? `Score: ${n.payload.score}` : null }));
  const courses = (data?.courses || []).map((r: any) => ({ id: r.courseId, title: r.title, percent: Math.round(r.progress.percent), completed: r.progress.completedLessons, total: r.progress.totalLessons, href: `/dashboard/student/${r.courseId}` }));

  return (
    <section className="p-6 space-y-4" aria-label="Student dashboard">
      <NotifPoller />
      <Breadcrumbs items={[{ label: "Dashboard" }]} />
      <StudentDashboardOverview header={{ title: 'Student dashboard' }} streakDays={6} navLinks={[{ id: 'planner', label: 'Planner', href: '/dashboard/student/plan' }, { id: 'timeline', label: 'Timeline', href: '/dashboard/student/timeline' }, { id: 'messages', label: 'Messages', href: '/dashboard/student/messages' }, { id: 'xp', label: 'XP', href: '/dashboard/student/xp' }, { id: 'ach', label: 'Achievements', href: '/dashboard/student/achievements' }, { id: 'lb', label: 'Leaderboard', href: '/dashboard/student/leaderboard' }]} notifications={notif as any} courses={courses as any} />
    </section>
  );
}

export const dynamic = 'force-dynamic';


