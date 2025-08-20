import { NextRequest, NextResponse } from "next/server";
import { withRouteTiming } from "@/server/withRouteTiming";
import { getCurrentUserInRoute, getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { isTestMode } from "@/lib/testMode";
import { z } from "zod";
import { jsonDto } from "@/lib/jsonDto";

const qSchemaProd = z.object({ student_id: z.string().uuid(), course_id: z.string().uuid().optional(), format: z.string().optional() }).strict();
const qSchemaTest = z.object({ student_id: z.string().min(1), course_id: z.string().optional(), format: z.string().optional() }).strict();

export const GET = withRouteTiming(async function GET(req: NextRequest) {
\tconst requestId = req.headers.get('x-request-id') || crypto.randomUUID();
\tconst user = await getCurrentUserInRoute(req);
\tif (!user) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Not signed in' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
\tlet q: { student_id: string; course_id?: string; format?: string };
\ttry {
\t\tq = (isTestMode() ? qSchemaTest : qSchemaProd).parse(Object.fromEntries(new URL(req.url).searchParams.entries()));
\t} catch (e: any) {
\t\treturn NextResponse.json({ error: { code: 'BAD_REQUEST', message: e.message }, requestId }, { status: 400, headers: { 'x-request-id': requestId } });
\t}
\tconst role = (user.user_metadata as any)?.role;
\tif (role !== 'parent' && role !== 'admin') {
\t\treturn NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Parents or admins only' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
\t}

\tif (isTestMode()) {
\t\tconst { listTestEnrollmentsByStudent, listTestLessonsByCourse, listTestParentsForStudent } = await import("@/lib/testStore");
\t\tconst linkedParents = listTestParentsForStudent(q.student_id);
\t\tif (role !== 'admin' && !linkedParents.includes(user.id)) {
\t\t\treturn NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Not linked to this student' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
\t\t}
\t\tconst enrollments = (listTestEnrollmentsByStudent(q.student_id) as any[]).filter(e => !q.course_id || e.course_id === q.course_id);
\t\tconst courses = enrollments.map(e => {
\t\t\tconst lessons = listTestLessonsByCourse(e.course_id) as any[];
\t\t\tconst total = (lessons ?? []).length;
\t\t\tconst completedLessons = 0;
\t\t\tconst percent = total > 0 ? Math.round((completedLessons / total) * 100) : 0;
\t\t\treturn { course_id: e.course_id, completedLessons, totalLessons: total, percent };
\t\t});
\t\tconst dto = z.object({ courses: z.array(z.object({ course_id: z.string(), completedLessons: z.number().int().nonnegative(), totalLessons: z.number().int().nonnegative(), percent: z.number().int().min(0).max(100) })) });
\t\treturn jsonDto({ courses } as any, dto as any, { requestId, status: 200 });
\t}

\tconst supabase = getRouteHandlerSupabase();
\t// Verify parent link (unless admin)
\tif (role !== 'admin') {
\t\tconst { data: links } = await supabase
\t\t\t.from('parent_links')
\t\t\t.select('parent_id,student_id')
\t\t\t.eq('parent_id', user.id)
\t\t\t.eq('student_id', q.student_id)
\t\t\t.limit(1);
\t\tif (!Array.isArray(links) || links.length === 0) {
\t\t\treturn NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Not linked to this student' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
\t\t}
\t}

\t// Fetch student enrollments
\tlet enrollments: any[] = [];
\t{
\t\tconst { data, error } = await supabase
\t\t\t.from('enrollments')
\t\t\t.select('course_id')
\t\t\t.eq('student_id', q.student_id)
\t\t\t.limit(2000);
\t\tif (error) return NextResponse.json({ error: { code: 'DB_ERROR', message: error.message }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
\t\tenrollments = (data ?? []) as any[];
\t}
\tif (q.course_id) enrollments = enrollments.filter(e => e.course_id === q.course_id);

\t// Compute per-course progress using MV if available, fallback to counts
\tconst courses: any[] = [];
\tfor (const e of enrollments) {
\t\tconst courseId = (e as any).course_id as string;
\t\tlet completedLessons = 0;
\t\tlet totalLessons = 0;
\t\ttry {
\t\t\tconst { data: mv } = await supabase
\t\t\t\t.from('user_course_progress_summary')
\t\t\t\t.select('completed_lessons')
\t\t\t\t.eq('user_id', q.student_id)
\t\t\t\t.eq('course_id', courseId)
\t\t\t\t.single();
\t\t\tcompletedLessons = Number((mv as any)?.completed_lessons || 0);
\t\t} catch {}
\t\tconst { count: total, error: lErr } = await supabase
\t\t\t.from('lessons')
\t\t\t.select('id', { count: 'exact', head: true } as any)
\t\t\t.eq('course_id', courseId);
\t\tif (lErr) return NextResponse.json({ error: { code: 'DB_ERROR', message: lErr.message }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
\t\ttotalLessons = total ?? 0;
\t\tconst percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
\t\tcourses.push({ course_id: courseId, completedLessons, totalLessons, percent });
\t}
\tconst dto = z.object({ courses: z.array(z.object({ course_id: z.string().uuid(), completedLessons: z.number().int().nonnegative(), totalLessons: z.number().int().nonnegative(), percent: z.number().int().min(0).max(100) })) });
\tconst fmt = (q.format || 'json').toLowerCase();
\tif (fmt === 'csv') {
\t\tconst lines = [['course_id','completed','total','percent'], ...courses.map(c => [c.course_id, String(c.completedLessons), String(c.totalLessons), String(c.percent)])];
\t\tconst csv = lines.map(r => r.join(',')).join('\n');
\t\treturn new Response(csv, { status: 200, headers: { 'content-type': 'text/csv; charset=utf-8', 'x-request-id': requestId } });
\t}
\treturn jsonDto({ courses } as any, dto as any, { requestId, status: 200 });
});

export const dynamic = 'force-dynamic';


