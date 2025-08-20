// @ts-nocheck
import { cookies } from "next/headers";
import { serverFetch } from "@/lib/serverFetch";
import Trans from "@/lib/i18n/Trans";

type Course = { id: string; title: string; description?: string | null };

export default async function TeacherCoursesGridPage() {
  const cookieStore = cookies();
  const testAuth = cookieStore.get("x-test-auth")?.value;

  const res = await serverFetch("/api/courses", {
    headers: testAuth ? { "x-test-auth": testAuth } : undefined
  });

  if (res.status === 401) {
    return (
      <main className="p-6">
        <p className="text-gray-700">
          <Trans keyPath="auth.notSignedIn" fallback="You are not signed in." /> <a className="underline" href="/login"><Trans keyPath="auth.signin" fallback="Sign in" /></a>
        </p>
      </main>
    );
  }

  const courses: Course[] = res.ok ? await res.json() : [];

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">Courses (read-only)</h1>
      <div
        className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        data-testid="courses-grid"
      >
        {courses.map((c) => (
          <a
            key={c.id}
            href={`/dashboard/teacher/${c.id}`}
            className="border rounded p-4 hover:bg-gray-50"
            data-testid="course-card"
          >
            <div className="font-medium" data-testid="course-title">{c.title}</div>
            {c.description && (
              <div className="text-gray-600 text-sm" data-testid="course-description">{c.description}</div>
            )}
          </a>
        ))}
        {(!courses || courses.length === 0) && (
          <div className="text-gray-500" data-testid="empty-state">No courses yet.</div>
        )}
      </div>
    </main>
  );
}


