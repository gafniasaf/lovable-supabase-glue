import { headers, cookies } from "next/headers";
import { createEnrollmentsGateway } from "@/lib/data/enrollments";
import { createLessonsGateway } from "@/lib/data/lessons";
import Trans from "@/lib/i18n/Trans";

type Enrollment = { id: string; course_id: string };

export default async function StudentLearningOverviewPage() {
  const h = headers();
  const cookieHeader = h.get("cookie") ?? "";
  const testAuth = h.get("x-test-auth") ?? cookies().get("x-test-auth")?.value;

  const baseHeaders: Record<string, string> = {
    ...(cookieHeader ? { cookie: cookieHeader } : {}),
    ...(testAuth ? { "x-test-auth": testAuth } : {}),
  };

  let enrollments: Enrollment[] = [];
  try { enrollments = await createEnrollmentsGateway().list() as any; } catch {}
  if (!enrollments || (enrollments as any).status === 401) {
    return (
      <main className="p-6">
        <p className="text-gray-700">
          <Trans keyPath="auth.notSignedIn" fallback="You are not signed in." /> {" "}
          <a className="underline" href="/login"><Trans keyPath="auth.signin" fallback="Sign in" /></a>
        </p>
      </main>
    );
  }
  const counts = await Promise.all(
    (enrollments ?? []).map(async (e) => {
      const lessons = await createLessonsGateway().listByCourse(e.course_id).catch(() => [] as any[]);
      return { course_id: e.course_id, count: Array.isArray(lessons) ? lessons.length : 0 };
    })
  );

  const courseIdToCount = new Map(counts.map((c) => [c.course_id, c.count] as const));

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold mb-4">Learning overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="learning-grid">
        {(enrollments ?? []).map((e) => (
          <a
            key={e.id}
            href={`/dashboard/teacher/${e.course_id}`}
            className="border rounded p-3 hover:bg-gray-50"
            data-testid="learning-card"
          >
            <div className="text-sm text-gray-600">Course ID</div>
            <div className="font-mono" data-testid="learning-course-id">{e.course_id}</div>
            <div className="text-sm text-gray-600 mt-2">Lessons</div>
            <div className="font-medium" data-testid="learning-lesson-count">{courseIdToCount.get(e.course_id) ?? 0}</div>
          </a>
        ))}
        {(!enrollments || enrollments.length === 0) && (
          <div className="text-gray-500">No enrollments yet.</div>
        )}
      </div>
    </main>
  );
}


