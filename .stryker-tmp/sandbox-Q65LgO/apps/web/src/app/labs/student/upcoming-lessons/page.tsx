// @ts-nocheck
import { headers, cookies } from "next/headers";
import { serverFetch } from "@/lib/serverFetch";
import Trans from "@/lib/i18n/Trans";

type Enrollment = { id: string; course_id: string };
type Lesson = { id: string; title: string; order_index: number };

export default async function StudentUpcomingLessonsPage() {
  const h = headers();
  const cookieHeader = h.get("cookie") ?? "";
  const testAuth = h.get("x-test-auth") ?? cookies().get("x-test-auth")?.value;

  const baseHeaders: Record<string, string> = {
    ...(cookieHeader ? { cookie: cookieHeader } : {}),
    ...(testAuth ? { "x-test-auth": testAuth } : {}),
  };

  const enrollmentsRes = await serverFetch(`/api/enrollments`, {
    cache: "no-store",
    headers: baseHeaders,
  });

  if (enrollmentsRes.status === 401) {
    return (
      <main className="p-6">
        <p className="text-gray-700">
          <Trans keyPath="auth.notSignedIn" fallback="You are not signed in." /> {" "}
          <a className="underline" href="/login"><Trans keyPath="auth.signin" fallback="Sign in" /></a>
        </p>
      </main>
    );
  }

  const enrollments: Enrollment[] = enrollmentsRes.ok ? await enrollmentsRes.json() : [];

  const perCourseFirstTwo = await Promise.all(
    (enrollments ?? []).map(async (e) => {
      const lessonsRes = await serverFetch(`/api/lessons?course_id=${e.course_id}`, {
        cache: "no-store",
        headers: baseHeaders,
      });
      const lessons: Lesson[] = lessonsRes.ok ? await lessonsRes.json() : [];
      const sorted = (Array.isArray(lessons) ? [...lessons] : []).sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
      const firstTwo = sorted.slice(0, 2).map(l => ({ course_id: e.course_id, order_index: l.order_index, title: l.title }));
      return firstTwo;
    })
  );

  const combined = perCourseFirstTwo.flat().sort((a, b) => {
    if (a.course_id < b.course_id) return -1;
    if (a.course_id > b.course_id) return 1;
    return (a.order_index ?? 0) - (b.order_index ?? 0);
  });

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold mb-4">Upcoming lessons</h1>
      <ul className="space-y-2" data-testid="upcoming-list">
        {(combined ?? []).map((row, idx) => (
          <li key={`${row.course_id}-${row.order_index}-${idx}`} className="border rounded p-3" data-testid="upcoming-row">
            <div className="text-sm text-gray-600">Course</div>
            <div className="font-mono" data-testid="upcoming-course-id">{row.course_id}</div>
            <div className="text-sm text-gray-600 mt-1">Order</div>
            <div className="font-medium" data-testid="upcoming-order">{row.order_index}</div>
            <div className="text-sm text-gray-600 mt-1">Title</div>
            <div className="font-medium" data-testid="upcoming-title">{row.title}</div>
          </li>
        ))}
        {(!enrollments || enrollments.length === 0) && (
          <li className="text-gray-500">No enrollments yet.</li>
        )}
      </ul>
    </main>
  );
}


