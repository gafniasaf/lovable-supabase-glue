import { getCurrentUser } from "@/lib/supabaseServer";
import { createGradingGateway } from "@/lib/data/grading";
import { headers, cookies } from "next/headers";
import { dashboardResponse } from "@education/shared";
import { createNotificationsGateway, createDashboardGateway, createInteractiveOutcomesGateway } from "@/lib/data";
import TeacherDashboardUI from "@/ui/v0/TeacherDashboard";

export default async function TeacherDashboard() {
  const user = await getCurrentUser();
  if (!user) return <section className="p-6" aria-label="Teacher dashboard"><h1 className="text-xl font-semibold">Your courses</h1><p>You are not signed in. <a className="underline" href="/login">Sign in</a></p></section>;
  const h = headers();
  const c = cookies();
  const dashJson = await createDashboardGateway().get().catch(() => ({} as any));
  const parsed = dashboardResponse.safeParse(dashJson);
  const data = parsed.success && parsed.data.role === 'teacher' ? parsed.data.data : null;

  // Fetch notifications (test-mode / SSR-friendly)
  const notifications: any[] = await createNotificationsGateway().list(0, 100).catch(() => []);
  const ia: any[] = await createInteractiveOutcomesGateway().listRecentForTeacher().catch(() => []);

  // Build props for v0 UI
  const kpis = data ? [
    { id: 'active', label: 'Active courses', value: data.kpis.activeCourses.value, trend: 'flat' as const },
    { id: 'students', label: 'Students', value: data.kpis.studentsEnrolled.value, trend: 'up' as const },
    { id: 'needs', label: 'Needs grading', value: data.kpis.needsGrading?.value ?? 0, trend: 'down' as const, hint: 'Estimated across courses' },
    { id: 'attempts', label: 'Attempts (24h)', value: data.kpis.interactiveAttempts?.value ?? 0, trend: 'flat' as const },
  ] : [];

  const quickLinks = [
    { id: 'profile', label: 'Edit profile', href: '/dashboard/teacher/profile', icon: 'profile' },
    { id: 'new', label: 'New course', href: '/dashboard/teacher/new', icon: 'course' },
    { id: 'queue', label: 'Grading queue', href: '/dashboard/teacher/grading-queue', icon: 'grading' },
  ];

  const recentlyGraded = (notifications || [])
    .filter((n: any) => n.type === 'submission:graded')
    .slice(0, 5)
    .map((n: any) => ({
      id: n.id,
      student: n.payload?.student_id || 'Student',
      assignment: n.payload?.assignment_id || 'Assignment',
      score: n.payload?.score != null ? String(n.payload.score) : null,
      at: new Date(n.created_at).toISOString(),
      href: '/dashboard/teacher/grading-queue'
    }));

  const notif = (notifications || []).slice(0, 5).map((n: any) => ({ id: n.id, type: n.type, at: new Date(n.created_at).toISOString(), href: undefined as string | undefined }));

  const state: 'default' | 'empty' = (kpis.length === 0 && recentlyGraded.length === 0 && notif.length === 0) ? 'empty' : 'default';

  return (
    <TeacherDashboardUI
      header={{ title: 'Teacher Dashboard', subtitle: 'Manage your courses and track student progress' }}
      kpis={kpis as any}
      quickLinks={quickLinks}
      recentlyGraded={recentlyGraded}
      notifications={notif}
      state={state}
    />
  );
}

export const dynamic = 'force-dynamic';


