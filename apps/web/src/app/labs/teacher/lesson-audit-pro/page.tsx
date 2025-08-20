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

function computeSeverity(chars: number): "low" | "medium" | "high" {
  if (chars < 200) return "low";
  if (chars < 1000) return "medium";
  return "high";
}

export default async function TeacherLessonAuditProPage({ searchParams }: { searchParams?: { [k: string]: string | string[] | undefined } }) {
  const cookieStore = cookies();
  const incoming = headers();
  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");
  const xTestAuth = incoming.get("x-test-auth") ?? cookieStore.get("x-test-auth")?.value;

  const baseHeaders: HeadersInit = {
    ...(cookieHeader ? { cookie: cookieHeader } : {}),
    ...(xTestAuth ? { 'x-test-auth': xTestAuth } : {})
  };

  const qRaw = (typeof searchParams?.q === 'string' ? searchParams?.q : Array.isArray(searchParams?.q) ? searchParams?.q[0] : undefined) || '';
  const severityRaw = (typeof searchParams?.severity === 'string' ? searchParams?.severity : Array.isArray(searchParams?.severity) ? searchParams?.severity[0] : undefined) || '';
  const sortRaw = (typeof searchParams?.sort === 'string' ? searchParams?.sort : Array.isArray(searchParams?.sort) ? searchParams?.sort[0] : undefined) || '';
  const dirRaw = (typeof searchParams?.dir === 'string' ? searchParams?.dir : Array.isArray(searchParams?.dir) ? searchParams?.dir[0] : undefined) || 'asc';
  const dir = dirRaw === 'desc' ? 'desc' : 'asc';
  const sortKey = sortRaw === 'content' || sortRaw === 'title' || sortRaw === 'course' ? sortRaw : undefined;
  const q = qRaw.trim().toLowerCase();
  const severityFilter = severityRaw === 'low' || severityRaw === 'medium' || severityRaw === 'high' ? severityRaw : undefined;

  let courses: Course[] = [];
  try { courses = await createCoursesGateway().listForTeacher() as any; } catch {}
  if (!courses || courses.length === 0) {
    return (
      <section className="p-6" aria-label="Lesson audit pro">
        <p className="text-gray-700"><Trans keyPath="auth.notSignedIn" fallback="You are not signed in." /> <a className="underline" href="/login"><Trans keyPath="auth.signin" fallback="Sign in" /></a></p>
      </section>
    );
  }

  type Row = { courseId: string; courseTitle: string; lessonTitle: string; order_index: number; titleLen: number; contentChars: number; severity: 'low'|'medium'|'high' };
  const rows: Row[] = [];
  for (const c of courses) {
    const lessons: Lesson[] = await createLessonsGateway().listByCourse(c.id).catch(() => [] as any[]);
    for (const l of lessons) {
      const contentChars = l.content?.length ?? 0;
      const titleLen = l.title?.length ?? 0;
      rows.push({
        courseId: c.id,
        courseTitle: c.title,
        lessonTitle: l.title,
        order_index: l.order_index,
        titleLen,
        contentChars,
        severity: computeSeverity(contentChars)
      });
    }
  }

  let filtered = rows.slice();
  if (q) filtered = filtered.filter(r => r.lessonTitle.toLowerCase().includes(q));
  if (severityFilter) filtered = filtered.filter(r => r.severity === severityFilter);

  if (sortKey) {
    filtered.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'content') {
        cmp = a.contentChars === b.contentChars ? 0 : a.contentChars < b.contentChars ? -1 : 1;
      } else if (sortKey === 'title') {
        const A = a.lessonTitle.toLowerCase();
        const B = b.lessonTitle.toLowerCase();
        cmp = A === B ? 0 : A < B ? -1 : 1;
      } else if (sortKey === 'course') {
        const A = a.courseTitle.toLowerCase();
        const B = b.courseTitle.toLowerCase();
        cmp = A === B ? 0 : A < B ? -1 : 1;
      }
      return dir === 'asc' ? cmp : -cmp;
    });
  } else {
    // Default sort: course asc, order asc
    filtered.sort((a, b) => {
      const A = a.courseTitle.toLowerCase();
      const B = b.courseTitle.toLowerCase();
      const cmpCourse = A === B ? 0 : A < B ? -1 : 1;
      if (cmpCourse !== 0) return cmpCourse;
      return a.order_index === b.order_index ? 0 : a.order_index < b.order_index ? -1 : 1;
    });
  }

  const totalLessons = filtered.length;

  // CSV
  const header = ["course_id", "course_title", "lesson_title", "order_index", "title_len", "content_chars", "severity"]; 
  const csvLines = [header.join(",")];
  for (const r of filtered) {
    csvLines.push([
      csvEscape(r.courseId),
      csvEscape(r.courseTitle),
      csvEscape(r.lessonTitle),
      String(r.order_index),
      String(r.titleLen),
      String(r.contentChars),
      r.severity
    ].join(","));
  }
  const csvString = csvLines.join("\n");
  const csvHref = `data:text/csv;charset=utf-8,${encodeURIComponent(csvString)}`;

  return (
    <section className="p-6" aria-label="Lesson audit pro">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Lesson Audit Pro</h1>
        <a className="underline" href={csvHref} download={`lesson-audit-pro.csv`} data-testid="audit-csv-link"><Trans keyPath="actions.downloadCsv" fallback="Download CSV" /></a>
      </div>
      <table className="min-w-full border" data-testid="audit-table">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left p-2 border">Course ID</th>
            <th className="text-left p-2 border">Lesson Title</th>
            <th className="text-left p-2 border">Order</th>
            <th className="text-left p-2 border">Title Len</th>
            <th className="text-left p-2 border">Content Chars</th>
            <th className="text-left p-2 border">Severity</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r, idx) => (
            <tr key={`${r.courseId}-${idx}`} className="border" data-testid="audit-row">
              <td className="p-2 border" data-testid="cell-course-id">{r.courseId}</td>
              <td className="p-2 border" data-testid="cell-lesson-title">{r.lessonTitle}</td>
              <td className="p-2 border" data-testid="cell-order">{r.order_index}</td>
              <td className="p-2 border" data-testid="cell-title-len">{r.titleLen}</td>
              <td className="p-2 border" data-testid="cell-content-chars">{r.contentChars}</td>
              <td className="p-2 border" data-testid="cell-severity">{r.severity}</td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td className="p-2 border text-gray-500" colSpan={6}>No lessons found.</td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr className="font-medium">
            <td className="p-2 border">Totals</td>
            <td className="p-2 border" colSpan={4}></td>
            <td className="p-2 border"><span data-testid="audit-total-lessons">{totalLessons}</span></td>
          </tr>
        </tfoot>
      </table>
    </section>
  );
}


