// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { withRouteTiming } from "@/server/withRouteTiming";
import { getCurrentUserInRoute, getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { isTestMode } from "@/lib/testMode";
import { listTestLessonsByCourse, listTestAssignmentsByCourse, listTestSubmissionsByAssignment } from "@/lib/testStore";
import { z } from "zod";
import { parseQuery } from "@/lib/zodQuery";

const engagementQuery = z.object({ course_id: z.string().uuid(), format: z.string().optional() }).strict();

export const GET = withRouteTiming(async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const user = await getCurrentUserInRoute(req);
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Not signed in' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
  let q: { course_id: string; format?: string };
  try {
    q = parseQuery(req, engagementQuery);
  } catch (e: any) {
    return NextResponse.json({ error: { code: 'BAD_REQUEST', message: e.message }, requestId }, { status: 400, headers: { 'x-request-id': requestId } });
  }
  if (isTestMode()) {
    const lessons = listTestLessonsByCourse(q.course_id) as any[];
    const assignments = listTestAssignmentsByCourse(q.course_id) as any[];
    let submissionsTotal = 0;
    for (const a of assignments) submissionsTotal += (listTestSubmissionsByAssignment(a.id) as any[]).length;
    return NextResponse.json({ lessons: lessons.length, assignments: assignments.length, submissions: submissionsTotal }, { status: 200, headers: { 'x-request-id': requestId } });
  }

  const supabase = getRouteHandlerSupabase();
  const { count: lessonsCount, error: lErr } = await supabase
    .from('lessons')
    .select('id', { count: 'exact', head: true })
    .eq('course_id', q.course_id);
  if (lErr) return NextResponse.json({ error: { code: 'DB_ERROR', message: lErr.message }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
  const { data: assignmentsRows, error: aErr } = await supabase
    .from('assignments')
    .select('id')
    .eq('course_id', q.course_id);
  if (aErr) return NextResponse.json({ error: { code: 'DB_ERROR', message: aErr.message }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
  const assignmentIds = (assignmentsRows ?? []).map((r: any) => r.id);
  let submissionsCount = 0;
  if (assignmentIds.length > 0) {
    const { count: subsCount, error: sErr } = await supabase
      .from('submissions')
      .select('id', { count: 'exact', head: true })
      .in('assignment_id', assignmentIds);
    if (sErr) return NextResponse.json({ error: { code: 'DB_ERROR', message: sErr.message }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
    submissionsCount = subsCount ?? 0;
  }
  const jsonData = { lessons: lessonsCount ?? 0, assignments: assignmentIds.length, submissions: submissionsCount };
  const fmt = ((q.format || 'json') as string).toLowerCase();
  if (fmt === 'csv') {
    const lines = [['metric','value'], ['lessons', String(jsonData.lessons)], ['assignments', String(jsonData.assignments)], ['submissions', String(jsonData.submissions)]];
    const csv = lines.map(r => r.join(',')).join('\n');
    return new Response(csv, { status: 200, headers: { 'content-type': 'text/csv; charset=utf-8', 'x-request-id': requestId } });
  }
  return NextResponse.json(jsonData, { status: 200, headers: { 'x-request-id': requestId } });
});

export const dynamic = 'force-dynamic';


