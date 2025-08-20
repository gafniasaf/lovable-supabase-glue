// @ts-nocheck
import { cookies, headers } from "next/headers";
import { serverFetch } from "@/lib/serverFetch";
import Trans from "@/lib/i18n/Trans";

type Course = { id: string; title: string };
type Lesson = { id: string; title: string; order_index: number };

function csvEscape(value: string): string {
  const v = value.replaceAll('"', '""');
  return `"${v}"`;
}

export default async function TeacherCourseInsightsAdvancedPage() {
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

  if (!courses || courses.length === 0) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-semibold mb-4">Course Insights (Advanced)</h1>
        <p className="text-gray-500">No courses yet.</p>
      </main>
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

  const rows = courses.map(c => {
    const lessons = (lessonsByCourse.get(c.id) ?? []).slice().sort((a, b) => a.order_index - b.order_index);
    const count = lessons.length;
    const firstTitle = count > 0 ? lessons[0].title : '';
    const lastTitle = count > 0 ? lessons[count - 1].title : '';
    return { course: c, count, firstTitle, lastTitle };
  });

  const totalCourses = rows.length;
  const totalLessons = rows.reduce((acc, r) => acc + r.count, 0);

  // Build CSV content server-side
  const header = ["course_id", "title", "lesson_count", "first_lesson", "last_lesson"]; 
  const csvLines = [header.join(",")];
  for (const r of rows) {
    csvLines.push([
      csvEscape(r.course.id),
      csvEscape(r.course.title),
      String(r.count),
      csvEscape(r.firstTitle),
      csvEscape(r.lastTitle)
    ].join(","));
  }
  const csvString = csvLines.join("\n");
  const csvHref = `data:text/csv;charset=utf-8,${encodeURIComponent(csvString)}`;

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Course Insights (Advanced)</h1>
        <a className="underline" href={csvHref} download={`course-insights.csv`} data-testid="insights-csv-link"><Trans keyPath="actions.downloadCsv" fallback="Download CSV" /></a>
      </div>
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
          {rows.map(r => (
            <tr key={r.course.id} className="border" data-testid="insights-row">
              <td className="p-2 border" data-testid="cell-course-id">{r.course.id}</td>
              <td className="p-2 border" data-testid="cell-title">{r.course.title}</td>
              <td className="p-2 border" data-testid="cell-lesson-count">{r.count}</td>
              <td className="p-2 border" data-testid="cell-first-lesson">{r.firstTitle}</td>
              <td className="p-2 border" data-testid="cell-last-lesson">{r.lastTitle}</td>
            </tr>
          ))}
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
    </main>
  );
}


