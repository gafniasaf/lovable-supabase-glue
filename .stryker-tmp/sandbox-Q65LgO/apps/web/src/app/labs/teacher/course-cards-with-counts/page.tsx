// @ts-nocheck
import { cookies, headers } from "next/headers";
import { serverFetch } from "@/lib/serverFetch";
import Trans from "@/lib/i18n/Trans";

type Course = { id: string; title: string; description?: string | null };

export default async function TeacherCourseCardsWithCountsPage() {
  const cookieStore = cookies();
  const incoming = headers();
  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");
  const xTestAuth = incoming.get("x-test-auth") ?? cookieStore.get("x-test-auth")?.value;

  const baseHeaders: HeadersInit = {
    ...(cookieHeader ? { cookie: cookieHeader } : {}),
    ...(xTestAuth ? { 'x-test-auth': xTestAuth } : {})
  };

  const coursesRes = await serverFetch('/api/courses', { cache: 'no-store', headers: baseHeaders });
  if (coursesRes.status === 401) {
    return (
      <main className="p-6">
        <p className="text-gray-700"><Trans keyPath="auth.notSignedIn" fallback="You are not signed in." /> <a className="underline" href="/login"><Trans keyPath="auth.signin" fallback="Sign in" /></a></p>
      </main>
    );
  }
  const courses: Course[] = coursesRes.ok ? await coursesRes.json() : [];

  const counts = await Promise.all((courses ?? []).map(async (c) => {
    const res = await serverFetch(`/api/lessons?course_id=${c.id}`, { cache: 'no-store', headers: baseHeaders });
    if (!res.ok) return [c.id, 0] as const;
    const lessons = await res.json();
    return [c.id, Array.isArray(lessons) ? lessons.length : 0] as const;
  }));
  const countByCourse = new Map<string, number>(counts);

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">Courses (with lesson counts)</h1>
      <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" data-testid="courses-grid">
        {(courses ?? []).map(c => (
          <a key={c.id} href={`/dashboard/teacher/${c.id}`} className="border rounded p-4 hover:bg-gray-50" data-testid="course-card">
            <div className="font-medium" data-testid="course-title">{c.title}</div>
            <div className="text-gray-600 text-sm">
              Lessons: <span data-testid="course-lesson-count">{countByCourse.get(c.id) ?? 0}</span>
            </div>
          </a>
        ))}
        {(!courses || courses.length === 0) && (
          <div className="text-gray-500" data-testid="empty-state">No courses yet.</div>
        )}
      </div>
    </main>
  );
}


