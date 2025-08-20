import { cookies, headers } from "next/headers";
import { createCoursesGateway } from "@/lib/data/courses";
import { createLessonsGateway } from "@/lib/data/lessons";
import Trans from "@/lib/i18n/Trans";

type Course = { id: string; title: string };
type Lesson = { id: string; title: string; content: string; order_index: number };

function csvEscape(value: string): string {
  const v = value.replaceAll('"', '""');
  return `"${v}"`;
}

export default async function TeacherContentQualityReportPage() {
  const cookieStore = cookies();
  const incoming = headers();
  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");
  const xTestAuth = incoming.get("x-test-auth") ?? cookieStore.get("x-test-auth")?.value;

  const baseHeaders: HeadersInit = {
    ...(cookieHeader ? { cookie: cookieHeader } : {}),
    ...(xTestAuth ? { 'x-test-auth': xTestAuth } : {})
  };

  let courses: Course[] = [];
  try { courses = await createCoursesGateway().listForTeacher() as any; } catch {}
  if (!courses || courses.length === 0) {
    return (
      <section className="p-6" aria-label="Content quality report">
        <p className="text-gray-700"><Trans keyPath="auth.notSignedIn" fallback="You are not signed in." /> <a className="underline" href="/login"><Trans keyPath="auth.signin" fallback="Sign in" /></a></p>
      </section>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <section className="p-6" aria-label="Content quality report">
        <h1 className="text-xl font-semibold mb-4">Content Quality Report</h1>
        <p className="text-gray-500">No courses yet.</p>
      </section>
    );
  }

  const lessonsByCourse = new Map<string, Lesson[]>();
  for (const c of courses) {
    const rows = await createLessonsGateway().listByCourse(c.id).catch(() => [] as any[]);
    lessonsByCourse.set(c.id, rows as Lesson[]);
  }

  const rows = courses.map(c => {
    const lessons = lessonsByCourse.get(c.id) ?? [];
    const lessonCount = lessons.length;
    const avgTitleLen = lessonCount === 0 ? 0 : Math.round(lessons.reduce((s, l) => s + (l.title?.length ?? 0), 0) / lessonCount);
    const avgContentLen = lessonCount === 0 ? 0 : Math.round(lessons.reduce((s, l) => s + (l.content?.length ?? 0), 0) / lessonCount);
    const longest = lessons.reduce((max: Lesson | null, l) => {
      const len = l.content?.length ?? 0;
      const cur = max ? (max.content?.length ?? 0) : -1;
      return len > cur ? l : max;
    }, null as Lesson | null);
    const longestLessonTitle = longest?.title ?? '';
    return { course: c, lessonCount, avgTitleLen, avgContentLen, longestLessonTitle };
  });

  const totalCourses = rows.length;
  const totalLessons = rows.reduce((acc, r) => acc + r.lessonCount, 0);

  const header = [
    "course_id",
    "title",
    "lesson_count",
    "avg_title_len",
    "avg_content_len",
    "longest_lesson_title"
  ];
  const csvLines = [header.join(",")];
  for (const r of rows) {
    csvLines.push([
      csvEscape(r.course.id),
      csvEscape(r.course.title),
      String(r.lessonCount),
      String(r.avgTitleLen),
      String(r.avgContentLen),
      csvEscape(r.longestLessonTitle)
    ].join(","));
  }
  const csvString = csvLines.join("\n");
  const csvHref = `data:text/csv;charset=utf-8,${encodeURIComponent(csvString)}`;

  return (
    <section className="p-6" aria-label="Content quality report">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Content Quality Report</h1>
        <a className="underline" href={csvHref} download={`content-quality-report.csv`} data-testid="quality-csv-link"><Trans keyPath="actions.downloadCsv" fallback="Download CSV" /></a>
      </div>
      <table className="min-w-full border" data-testid="quality-table">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left p-2 border">Course ID</th>
            <th className="text-left p-2 border">Title</th>
            <th className="text-left p-2 border">Lesson Count</th>
            <th className="text-left p-2 border">Avg Title Len</th>
            <th className="text-left p-2 border">Avg Content Len</th>
            <th className="text-left p-2 border">Longest Lesson</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.course.id} className="border" data-testid="quality-row">
              <td className="p-2 border" data-testid="cell-course-id">{r.course.id}</td>
              <td className="p-2 border" data-testid="cell-course-title">{r.course.title}</td>
              <td className="p-2 border" data-testid="cell-lesson-count">{r.lessonCount}</td>
              <td className="p-2 border" data-testid="cell-avg-title-len">{r.avgTitleLen}</td>
              <td className="p-2 border" data-testid="cell-avg-content-len">{r.avgContentLen}</td>
              <td className="p-2 border" data-testid="cell-longest-lesson">{r.longestLessonTitle}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-medium">
            <td className="p-2 border">Totals</td>
            <td className="p-2 border">
              <span>Courses: </span>
              <span data-testid="quality-total-courses">{totalCourses}</span>
            </td>
            <td className="p-2 border">
              <span>Total lessons: </span>
              <span data-testid="quality-total-lessons">{totalLessons}</span>
            </td>
            <td className="p-2 border"></td>
            <td className="p-2 border"></td>
            <td className="p-2 border"></td>
          </tr>
        </tfoot>
      </table>
    </section>
  );
}


