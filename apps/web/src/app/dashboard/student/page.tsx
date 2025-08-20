import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createDashboardGateway } from "@/lib/data/dashboard";
import { dashboardResponse } from "@education/shared";
import { createNotificationsGateway } from "@/lib/data/notifications";
import { useNotificationsPoll } from "@/lib/hooks/useNotificationsPoll";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import NotifPoller from "@/app/dashboard/student/NotifPoller";
import Trans from "@/lib/i18n/Trans";

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
  return (
    <section className="p-6 space-y-4" aria-label="Student dashboard">
      {/* background polling for real-time feel */}
      <NotifPoller />
      <Breadcrumbs items={[{ label: "Dashboard" }]} />
      <h1 className="text-xl font-semibold"><Trans keyPath="dashboard.student" fallback="Student dashboard" /></h1>
      {data?.continueLearning && (
        <section className="border rounded p-4 bg-white">
          <h2 className="font-medium">Continue learning</h2>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <div className="font-semibold">{data.continueLearning.courseTitle}</div>
              {data.continueLearning.nextLessonTitle && (
                <div className="text-sm text-gray-600">Next: {data.continueLearning.nextLessonTitle}</div>
              )}
            </div>
            <Link className="underline" href={`/dashboard/student/${data.continueLearning.courseId}${data.continueLearning.nextLessonId ? `#lesson-${data.continueLearning.nextLessonId}` : ''}`}>Open</Link>
          </div>
          {data.continueLearning?.nextLessonId ? (
            <form action={async () => {
            	"use server";
            	try {
            		const { createLessonsGateway } = await import("@/lib/data/lessons");
            		const nextId = data?.continueLearning?.nextLessonId;
            		if (!nextId) return;
            		await createLessonsGateway().markComplete(nextId);
            	} catch {}
            	revalidatePath('/dashboard/student');
            }}>
            	<button className="mt-3 underline text-sm" data-testid="continue-mark-complete">Mark next lesson complete</button>
            </form>
          ) : null}
        </section>
      )}
      {/* Streak / gamification (lightweight, optional) */}
      <section className="border rounded p-4 bg-white">
        <h2 className="font-medium flex items-center gap-2">
          <span>🔥</span> <span>Streak</span>
        </h2>
        <div className="mt-2 text-sm text-gray-700">
          <span className="text-2xl font-semibold">6</span> days
        </div>
        <div className="text-xs text-gray-500 mt-1">Keep it up — learning every day builds momentum.</div>
      </section>
      <section>
        <h2 className="font-medium">Notifications</h2>
        {notifications.length === 0 ? (
          <div className="text-gray-500">No notifications</div>
        ) : (
          <ul className="mt-2 space-y-1">
            {notifications.slice(0,5).map((n: any) => (
              <li key={n.id} className="text-sm">
                <span className="font-medium">{n.type}</span>
                <span className="ml-2 text-gray-600">{new Date(n.created_at).toLocaleString()}</span>
                {n.type === 'submission:graded' && n.payload?.score != null && (
                  <span className="ml-2">Score: {n.payload.score}</span>
                )}
                {n.type === 'message:new' && n.payload?.thread_id && (
                  <a className="ml-2 underline" href={`/labs/system/inbox?thread=${encodeURIComponent(n.payload.thread_id)}`}>Open thread</a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2 className="font-medium">My courses</h2>
        <div className="mt-1 text-sm text-gray-600">
          <a className="underline" href="/dashboard/student/plan">Planner</a>
          <span className="mx-2">·</span>
          <a className="underline" href="/dashboard/student/timeline">Timeline</a>
          <span className="mx-2">·</span>
          <a className="underline" href="/dashboard/student/messages">Messages</a>
          <span className="mx-2">·</span>
          <a className="underline" href="/dashboard/student/xp">XP</a>
          <span className="mx-2">·</span>
          <a className="underline" href="/dashboard/student/achievements">Achievements</a>
          <span className="mx-2">·</span>
          <a className="underline" href="/dashboard/student/leaderboard">Leaderboard</a>
        </div>
        {data ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3" data-testid="student-courses-grid">
            {(data.courses ?? []).map((r: any) => (
              <Link key={r.courseId} data-testid="student-course-card" href={`/dashboard/student/${r.courseId}`} className="block border rounded p-3 hover:bg-gray-50">
                <div className="font-medium">{r.title}</div>
                <div className="mt-2 h-2 bg-gray-200 rounded">
                  <div className="h-2 bg-green-500 rounded" style={{ width: `${Math.round(r.progress.percent)}%` }} />
                </div>
                <div className="text-xs text-gray-600 mt-1">{r.progress.completedLessons}/{r.progress.totalLessons} lessons</div>
              </Link>
            ))}
            {(!data.courses || data.courses.length === 0) && (
              <div className="text-gray-500">
                No enrollments yet. <span className="ml-2">Ask your teacher to enroll you or explore available courses.</span>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
            <div className="border rounded p-3">
              <div className="skeleton h-4 w-40 mb-2" />
              <div className="skeleton h-2 w-full" />
              <div className="skeleton h-2 w-1/2 mt-1" />
            </div>
            <div className="border rounded p-3">
              <div className="skeleton h-4 w-40 mb-2" />
              <div className="skeleton h-2 w-full" />
              <div className="skeleton h-2 w-1/2 mt-1" />
            </div>
            <div className="border rounded p-3">
              <div className="skeleton h-4 w-40 mb-2" />
              <div className="skeleton h-2 w-full" />
              <div className="skeleton h-2 w-1/2 mt-1" />
            </div>
          </div>
        )}
      </section>
    </section>
  );
}


