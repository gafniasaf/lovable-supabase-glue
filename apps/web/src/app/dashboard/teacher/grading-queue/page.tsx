import { getCurrentUser } from "@/lib/supabaseServer";
import { createCoursesGateway } from "@/lib/data/courses";
import { createGradingGateway } from "@/lib/data/grading";
import { createDashboardGateway } from "@/lib/data/dashboard";
import GradingQueue from "@/ui/v0/GradingQueue";

type SubmissionRow = { id: string; assignment_id: string; student_id: string; submitted_at: string; score: number | null };

export default async function GradingQueuePage({ searchParams }: { searchParams?: { courseId?: string; assignmentId?: string; page?: string; pageSize?: string } }) {
  const user = await getCurrentUser();
  if (!user) return (
    <section className="p-6" aria-label="Grading queue">
      <span>You are not signed in. <a className="underline" href="/login">Sign in</a></span>
    </section>
  );
  const courseId = searchParams?.courseId || undefined;
  const assignmentId = searchParams?.assignmentId || undefined;
  const page = Number(searchParams?.page || 1);
  const pageSize = Math.max(5, Math.min(100, Number(searchParams?.pageSize || 20)));
  let rows: SubmissionRow[] = [];
  let totalEstimated = 0;
  try {
    const res = await createGradingGateway().listUngraded({ courseId, assignmentId, page, limit: pageSize });
    rows = res.rows as any;
    totalEstimated = res.totalEstimated || 0;
  } catch {
    // Graceful fallback: show empty state if unauthorized or API error
    rows = [] as any;
    totalEstimated = 0;
  }
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
  function buildHref(next: { courseId?: string; assignmentId?: string; page?: number; pageSize?: number }) {
    const qs = new URLSearchParams();
    const c = next.courseId ?? courseId ?? '';
    const a = next.assignmentId ?? assignmentId ?? '';
    const p = next.page ?? page;
    const s = next.pageSize ?? pageSize;
    if (c) qs.set('courseId', c);
    if (a) qs.set('assignmentId', a);
    if (p) qs.set('page', String(p));
    if (s) qs.set('pageSize', String(s));
    const qsStr = qs.toString();
    return qsStr ? `/dashboard/teacher/grading-queue?${qsStr}` : `/dashboard/teacher/grading-queue`;
  }

  const courseOptions = ([{ id: '', label: 'All', href: buildHref({ courseId: '', assignmentId: '' }), selected: !courseId }] as any[])
    .concat((courses || []).map((c: any) => ({ id: c.id, label: c.title, href: buildHref({ courseId: c.id, assignmentId: '' }), selected: c.id === courseId })));

  const assignmentOptions = courseId
    ? ([{ id: '', label: 'All', href: buildHref({ courseId, assignmentId: '' }), selected: !assignmentId }] as any[])
        .concat((assignments || []).map((a: any) => ({ id: a.id, label: a.title, href: buildHref({ courseId, assignmentId: a.id }), selected: a.id === assignmentId })))
    : [];

  const pageSizeOptions = ([10, 20, 50, 100] as const).map((n) => ({ value: n, label: String(n), href: buildHref({ page: 1, pageSize: n }), selected: n === pageSize }));

  const items = (rows || []).map((r: any) => ({
    id: r.id,
    courseTitle: r.course_id ? titlesMap[r.course_id] : null,
    studentName: namesMap[r.student_id] || r.student_id,
    submittedAt: new Date(r.submitted_at).toISOString(),
    openHref: `/dashboard/teacher/${r.course_id ?? ''}/assignments/${r.assignment_id}/submissions`
  }));

  const prevHref = page > 1 ? buildHref({ page: Math.max(1, page - 1) }) : null;
  const nextHref = (rows?.length || 0) >= pageSize ? buildHref({ page: page + 1 }) : null;

  return (
    <GradingQueue
      header={{ totalEstimated: totalEstimated || undefined }}
      filters={{ courses: courseOptions as any, assignments: assignmentOptions as any, pageSizes: pageSizeOptions as any, applyHref: buildHref({ page: 1 }) }}
      items={items as any}
      pagination={{ page, prevHref, nextHref, totalHint: totalEstimated ? `~${totalEstimated} total` : undefined }}
      state={(items.length === 0) ? 'empty' : 'default'}
    />
  );
}

export const dynamic = 'force-dynamic';


