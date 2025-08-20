// @ts-nocheck
import { cookies, headers } from "next/headers";
import { serverFetch } from "@/lib/serverFetch";
import Trans from "@/lib/i18n/Trans";

type Course = { id: string; title: string };

export default async function TeacherAnalyticsPage() {
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
      <section className="p-6" aria-label="Teacher analytics">
        <p className="text-gray-700"><Trans keyPath="auth.notSignedIn" fallback="You are not signed in." /> <a className="underline" href="/login"><Trans keyPath="auth.signin" fallback="Sign in" /></a></p>
      </section>
    );
  }
  const courses: Course[] = coursesRes.ok ? await coursesRes.json() : [];

  if (!courses || courses.length === 0) {
    return (
      <section className="p-6" aria-label="Teacher analytics">
        <h1 className="text-xl font-semibold mb-4">Teacher Analytics</h1>
        <p className="text-gray-500">No courses yet.</p>
      </section>
    );
  }

  const counts = await Promise.all(courses.map(async (c) => {
    const res = await serverFetch(`/api/lessons?course_id=${c.id}`, { cache: 'no-store', headers: baseHeaders });
    if (!res.ok) return [c.id, 0] as const;
    const lessons = await res.json();
    return [c.id, Array.isArray(lessons) ? lessons.length : 0] as const;
  }));
  const countByCourse = new Map<string, number>(counts);

  const totalCourses = courses.length;
  const totalLessons = courses.reduce((acc, c) => acc + (countByCourse.get(c.id) ?? 0), 0);

  // CSV/JSON exports
  const header = ["course_id", "title", "lesson_count"];
  const csvLines = [header.join(",")];
  for (const c of courses) {
    const cnt = countByCourse.get(c.id) ?? 0;
    const esc = (v: string) => `"${(v || '').replaceAll('"', '""')}"`;
    csvLines.push([c.id, esc(c.title), String(cnt)].join(","));
  }
  const csvString = csvLines.join("\n");
  const csvHref = `data:text/csv;charset=utf-8,${encodeURIComponent(csvString)}`;
  const jsonHref = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(courses.map(c => ({ course_id: c.id, title: c.title, lesson_count: countByCourse.get(c.id) ?? 0 }))))}`;

  return (
    <section className="p-6" aria-label="Teacher analytics">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Teacher Analytics</h1>
        <div className="flex gap-3">
          <a className="underline" href={csvHref} download={`teacher-analytics.csv`} data-testid="analytics-csv-link"><Trans keyPath="actions.downloadCsv" fallback="Download CSV" /></a>
          <a className="underline" href={jsonHref} download={`teacher-analytics.json`} data-testid="analytics-json-link">Download JSON</a>
        </div>
      </div>
      <table className="min-w-full border" data-testid="analytics-table">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left p-2 border">Course ID</th>
            <th className="text-left p-2 border">Title</th>
            <th className="text-left p-2 border">Lesson Count</th>
          </tr>
        </thead>
        <tbody>
          {courses.map(c => (
            <tr key={c.id} className="border" data-testid="row-course">
              <td className="p-2 border" data-testid="cell-course-id">{c.id}</td>
              <td className="p-2 border" data-testid="cell-course-title">{c.title}</td>
              <td className="p-2 border" data-testid="cell-lesson-count">{countByCourse.get(c.id) ?? 0}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-medium">
            <td className="p-2 border">Totals</td>
            <td className="p-2 border">
              <span>Courses: </span>
              <span data-testid="analytics-total-courses">{totalCourses}</span>
            </td>
            <td className="p-2 border">
              <span>Total lessons: </span>
              <span data-testid="analytics-total-lessons">{totalLessons}</span>
            </td>
          </tr>
        </tfoot>
      </table>
    </section>
  );
}


