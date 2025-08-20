// @ts-nocheck
import { cookies, headers } from "next/headers";
import { serverFetch } from "@/lib/serverFetch";
import Trans from "@/lib/i18n/Trans";

type Course = { id: string; title: string };
type Lesson = { id: string; title: string; content: string; order_index: number };

function csvEscape(value: string): string {
  const v = value.replaceAll('"', '""');
  return `"${v}"`;
}

export default async function TeacherLessonCatalogPage({ searchParams }: { searchParams?: { [k: string]: string | string[] | undefined } }) {
  const cookieStore = cookies();
  const incoming = headers();
  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");
  const xTestAuth = incoming.get("x-test-auth") ?? cookieStore.get("x-test-auth")?.value;

  const baseHeaders: HeadersInit = {
    ...(cookieHeader ? { cookie: cookieHeader } : {}),
    ...(xTestAuth ? { 'x-test-auth': xTestAuth } : {})
  };

  const qRaw = (typeof searchParams?.q === 'string' ? searchParams?.q : Array.isArray(searchParams?.q) ? searchParams?.q[0] : undefined) || '';
  const sortRaw = (typeof searchParams?.sort === 'string' ? searchParams?.sort : Array.isArray(searchParams?.sort) ? searchParams?.sort[0] : undefined) || '';
  const dirRaw = (typeof searchParams?.dir === 'string' ? searchParams?.dir : Array.isArray(searchParams?.dir) ? searchParams?.dir[0] : undefined) || 'asc';
  const dir = dirRaw === 'desc' ? 'desc' : 'asc';
  const sortKey = sortRaw === 'order' || sortRaw === 'content' || sortRaw === 'course' ? sortRaw : undefined;

  const coursesRes = await serverFetch('/api/courses', { cache: 'no-store', headers: baseHeaders });
  if (coursesRes.status === 401) {
    return (
      <section className="p-6" aria-label="Lesson catalog">
        <p className="text-gray-700"><Trans keyPath="auth.notSignedIn" fallback="You are not signed in." /> <a className="underline" href="/login"><Trans keyPath="auth.signin" fallback="Sign in" /></a></p>
      </section>
    );
  }
  const courses: Course[] = coursesRes.ok ? await coursesRes.json() : [];

  // Build flat catalog
  type Row = { courseId: string; courseTitle: string; lessonTitle: string; order_index: number; contentChars: number };
  const rows: Row[] = [];
  for (const c of courses) {
    const res = await serverFetch(`/api/lessons?course_id=${c.id}`, { cache: 'no-store', headers: baseHeaders });
    const lessons: Lesson[] = res.ok ? await res.json() : [];
    for (const l of lessons) {
      rows.push({ courseId: c.id, courseTitle: c.title, lessonTitle: l.title, order_index: l.order_index, contentChars: (l.content?.length ?? 0) });
    }
  }

  // Filter by q (lessonTitle contains, case-insensitive)
  const q = qRaw.trim().toLowerCase();
  let filtered = q ? rows.filter(r => r.lessonTitle.toLowerCase().includes(q)) : rows.slice();

  // Sort
  if (sortKey) {
    filtered.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'order') {
        cmp = a.order_index === b.order_index ? 0 : a.order_index < b.order_index ? -1 : 1;
      } else if (sortKey === 'content') {
        cmp = a.contentChars === b.contentChars ? 0 : a.contentChars < b.contentChars ? -1 : 1;
      } else if (sortKey === 'course') {
        const A = a.courseTitle.toLowerCase();
        const B = b.courseTitle.toLowerCase();
        cmp = A === B ? 0 : A < B ? -1 : 1;
      }
      return dir === 'asc' ? cmp : -cmp;
    });
  } else {
    // Default sort: course title asc, then order_index asc
    filtered.sort((a, b) => {
      const A = a.courseTitle.toLowerCase();
      const B = b.courseTitle.toLowerCase();
      const cmpCourse = A === B ? 0 : A < B ? -1 : 1;
      if (cmpCourse !== 0) return cmpCourse;
      return a.order_index === b.order_index ? 0 : a.order_index < b.order_index ? -1 : 1;
    });
  }

  const totalRows = filtered.length;

  // CSV
  const header = ["course_id", "course_title", "lesson_title", "order_index", "content_chars"]; 
  const csvLines = [header.join(",")];
  for (const r of filtered) {
    csvLines.push([
      csvEscape(r.courseId),
      csvEscape(r.courseTitle),
      csvEscape(r.lessonTitle),
      String(r.order_index),
      String(r.contentChars)
    ].join(","));
  }
  const csvString = csvLines.join("\n");
  const csvHref = `data:text/csv;charset=utf-8,${encodeURIComponent(csvString)}`;

  return (
    <section className="p-6" aria-label="Lesson catalog">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Lesson Catalog</h1>
        <a className="underline" href={csvHref} download={`lesson-catalog.csv`} data-testid="catalog-csv-link"><Trans keyPath="actions.downloadCsv" fallback="Download CSV" /></a>
      </div>
      <table className="min-w-full border" data-testid="catalog-table">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left p-2 border">Course ID</th>
            <th className="text-left p-2 border">Course Title</th>
            <th className="text-left p-2 border">Lesson Title</th>
            <th className="text-left p-2 border">Order</th>
            <th className="text-left p-2 border">Content Chars</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((r, idx) => (
            <tr key={`${r.courseId}-${idx}`} className="border" data-testid="catalog-row">
              <td className="p-2 border" data-testid="cell-course-id">{r.courseId}</td>
              <td className="p-2 border" data-testid="cell-course-title">{r.courseTitle}</td>
              <td className="p-2 border" data-testid="cell-lesson-title">{r.lessonTitle}</td>
              <td className="p-2 border" data-testid="cell-order">{r.order_index}</td>
              <td className="p-2 border" data-testid="cell-content-chars">{r.contentChars}</td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td className="p-2 border text-gray-500" colSpan={5}>No lessons found.</td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr className="font-medium">
            <td className="p-2 border">Totals</td>
            <td className="p-2 border" colSpan={3}></td>
            <td className="p-2 border"><span data-testid="catalog-total-rows">{totalRows}</span></td>
          </tr>
        </tfoot>
      </table>
    </section>
  );
}


