// @ts-nocheck
import { cookies, headers } from "next/headers";
import { serverFetch } from "@/lib/serverFetch";
import Trans from "@/lib/i18n/Trans";

type Course = { id: string; title: string };
type Lesson = { id: string; title: string; order_index: number };

export default async function TeacherCourseInsightsPage() {
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
      <section className="p-6" aria-label="Course insights">
        <p className="text-gray-700"><Trans keyPath="auth.notSignedIn" fallback="You are not signed in." /> <a className="underline" href="/login"><Trans keyPath="auth.signin" fallback="Sign in" /></a></p>
      </section>
    );
  }
  const courses: Course[] = coursesRes.ok ? await coursesRes.json() : [];

  if (!courses || courses.length === 0) {
    return (
      <section className="p-6" aria-label="Course insights">
        <h1 className="text-xl font-semibold mb-4">Course Insights</h1>
        <p className="text-gray-500">No courses yet.</p>
      </section>
    );
  }

  const lessonsByCourse = new Map<string, Lesson[]>();
  for (const c of courses) {
    const res = await serverFetch(`/api/lessons?course_id=${c.id}`, { cache: 'no-store', headers: baseHeaders });
    if (res.ok) {
      const rows: any[] = await res.json();
      lessonsByCourse.set(c.id, rows as Lesson[]);
    } else {
      lessonsByCourse.set(c.id, []);
    }
  }

  const totalCourses = courses.length;
  const totalLessons = courses.reduce((acc, c) => acc + (lessonsByCourse.get(c.id)?.length ?? 0), 0);

  return (
    <section className="p-6" aria-label="Course insights">
      <h1 className="text-xl font-semibold mb-4">Course Insights</h1>
      {courses[0] && (
        <div className="mb-3 flex items-center gap-3">
          <a className="underline" href={`/api/reports/grade-distribution?course_id=${encodeURIComponent(courses[0].id)}&format=csv`}>Download grades CSV</a>
          <a className="underline" href={`/labs/teacher/engagement?course_id=${encodeURIComponent(courses[0].id)}`}>Engagement snapshot</a>
        </div>
      )}
      <table className="min-w-full border" data-testid="insights-table">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left p-2 border">Course ID</th>
            <th className="text-left p-2 border">Title</th>
            <th className="text-left p-2 border">Lesson Count</th>
            <th className="text-left p-2 border">First Lesson</th>
            <th className="text-left p-2 border">Last Lesson</th>
          </tr>
        </thead>
        <tbody>
          {courses.map(c => {
            const lessons = (lessonsByCourse.get(c.id) ?? []).slice().sort((a, b) => a.order_index - b.order_index);
            const count = lessons.length;
            const firstTitle = count > 0 ? lessons[0].title : '';
            const lastTitle = count > 0 ? lessons[count - 1].title : '';
            return (
              <tr key={c.id} className="border" data-testid="insights-row">
                <td className="p-2 border" data-testid="cell-course-id">{c.id}</td>
                <td className="p-2 border" data-testid="cell-title">{c.title}</td>
                <td className="p-2 border" data-testid="cell-lesson-count">{count}</td>
                <td className="p-2 border" data-testid="cell-first-lesson">{firstTitle}</td>
                <td className="p-2 border" data-testid="cell-last-lesson">{lastTitle}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="font-medium">
            <td className="p-2 border">Totals</td>
            <td className="p-2 border">
              <span>Courses: </span>
              <span data-testid="insights-total-courses">{totalCourses}</span>
            </td>
            <td className="p-2 border">
              <span>Total lessons: </span>
              <span data-testid="insights-total-lessons">{totalLessons}</span>
            </td>
            <td className="p-2 border"></td>
            <td className="p-2 border"></td>
          </tr>
        </tfoot>
      </table>
    </section>
  );
}


