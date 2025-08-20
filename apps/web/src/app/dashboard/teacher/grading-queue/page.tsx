import Link from "next/link";
import { getCurrentUser } from "@/lib/supabaseServer";
import Trans from "@/lib/i18n/Trans";
import { createCoursesGateway } from "@/lib/data/courses";
import { createGradingGateway } from "@/lib/data/grading";
import { createDashboardGateway } from "@/lib/data/dashboard";

type SubmissionRow = { id: string; assignment_id: string; student_id: string; submitted_at: string; score: number | null };

export default async function GradingQueuePage({ searchParams }: { searchParams?: { courseId?: string; assignmentId?: string; page?: string; pageSize?: string } }) {
  const user = await getCurrentUser();
  if (!user) return (
    <section className="p-6" aria-label="Grading queue">
      <span><Trans keyPath="auth.notSignedIn" fallback="You are not signed in." /> <a className="underline" href="/login"><Trans keyPath="auth.signin" fallback="Sign in" /></a></span>
    </section>
  );
  const courseId = searchParams?.courseId || undefined;
  const assignmentId = searchParams?.assignmentId || undefined;
  const page = Number(searchParams?.page || 1);
  const pageSize = Math.max(5, Math.min(100, Number(searchParams?.pageSize || 20)));
  const { rows, totalEstimated } = await createGradingGateway().listUngraded({ courseId, assignmentId, page, limit: pageSize });
  const courses = await createCoursesGateway().listForTeacher().catch(() => [] as any[]);
  // Load assignments for the selected course (server-side)
  let assignments: any[] = [];
  if (courseId) {
    assignments = await createGradingGateway().listAssignmentsForCourse(courseId).catch(() => []);
  }
  // Resolve names and course titles
  const studentIds = Array.from(new Set(rows.map((r: any) => r.student_id)));
  const courseIds = Array.from(new Set(rows.map((r: any) => r.course_id).filter(Boolean)));
  const [namesMap, titlesMap] = await Promise.all([
    createDashboardGateway().getDisplayNamesByIds(studentIds).catch(() => ({} as Record<string, string>)),
    createDashboardGateway().getCourseTitlesByIds(courseIds as string[]).catch(() => ({} as Record<string, string>))
  ]);
  return (
    <section className="p-6 space-y-4" aria-label="Grading queue">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Grading queue {totalEstimated ? <span className="text-sm text-gray-600">(~{totalEstimated})</span> : null}</h1>
        <Link className="underline" href="/dashboard/teacher"><Trans keyPath="common.backToCourses" fallback="Back to courses" /></Link>
      </div>
      <details className="text-sm">
        <summary className="cursor-pointer select-none underline">Filters</summary>
        <form className="mt-2 flex items-center gap-2 flex-wrap" action="/dashboard/teacher/grading-queue" method="get" aria-label="Grading queue filters">
        <label className="text-sm text-gray-600" htmlFor="grading-course">Filter by course:</label>
        <select id="grading-course" name="courseId" defaultValue={courseId || ''} className="border rounded p-1" data-testid="grading-filter-course">
          <option value="">All</option>
          {(courses ?? []).map((c: any) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
        {courseId ? (
          <>
            <label className="text-sm text-gray-600" htmlFor="grading-assignment">Assignment:</label>
            <select id="grading-assignment" name="assignmentId" defaultValue={assignmentId || ''} className="border rounded p-1" data-testid="grading-filter-assignment">
              <option value="">All</option>
              {(assignments ?? []).map((a: any) => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </select>
          </>
        ) : null}
        <label className="text-sm text-gray-600" htmlFor="grading-page-size">Per page:</label>
        <select id="grading-page-size" name="pageSize" defaultValue={String(pageSize)} className="border rounded p-1" data-testid="grading-page-size">
          {([10, 20, 50, 100] as const).map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <button className="underline text-sm" type="submit" data-testid="grading-apply">Apply</button>
        </form>
      </details>
      {(!rows || rows.length === 0) ? (
        <div className="text-gray-500">No ungraded submissions yet.</div>
      ) : (
        <table className="w-full text-sm border">
          <caption className="sr-only">Ungraded submissions</caption>
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="p-2 border">Submission</th>
              <th className="p-2 border">Course</th>
              <th className="p-2 border">Student</th>
              <th className="p-2 border">Submitted</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any) => (
              <tr key={r.id} className="border-b">
                <td className="p-2 border font-mono text-xs">{r.id}</td>
                <td className="p-2 border">{(r.course_id && titlesMap[r.course_id]) || '-'}</td>
                <td className="p-2 border">{namesMap[r.student_id] || r.student_id}</td>
                <td className="p-2 border">{new Date(r.submitted_at).toLocaleString()}</td>
                <td className="p-2 border">
                  <Link className="underline text-sm" href={`/dashboard/teacher/${r.course_id ?? ''}/assignments/${r.assignment_id}/submissions`}>Open</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="flex gap-2 items-center" aria-label="Pagination">
        <Link className={`underline text-sm ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`} aria-disabled={page <= 1} href={`/dashboard/teacher/grading-queue?${new URLSearchParams({ ...(courseId ? { courseId } : {}), ...(assignmentId ? { assignmentId } : {}), page: String(Math.max(1, page - 1)), pageSize: String(pageSize) }).toString()}`} data-testid="grading-prev"><Trans keyPath="common.prev" fallback="Prev" /></Link>
        <span className="text-xs text-gray-600">Page {page}</span>
        <Link className={`underline text-sm ${(rows?.length ?? 0) < pageSize ? 'pointer-events-none opacity-50' : ''}`} aria-disabled={(rows?.length ?? 0) < pageSize} href={`/dashboard/teacher/grading-queue?${new URLSearchParams({ ...(courseId ? { courseId } : {}), ...(assignmentId ? { assignmentId } : {}), page: String(page + 1), pageSize: String(pageSize) }).toString()}`} data-testid="grading-next"><Trans keyPath="common.next" fallback="Next" /></Link>
        <span className="text-xs text-gray-600 ml-2">{totalEstimated ? `~${totalEstimated} total` : ''}</span>
      </div>
    </section>
  );
}


