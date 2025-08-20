/**
 * Enrollments API
 *
 * POST /api/enrollments — enroll current student into a course
 * GET  /api/enrollments — list enrollments for the current student
 */
// @ts-nocheck

import { NextResponse, NextRequest } from "next/server";
import { getRouteHandlerSupabase, getCurrentUserInRoute } from "@/lib/supabaseServer";
import { enrollmentCreateRequest, enrollment, enrollmentListDto } from "@education/shared";
import { isTestMode } from "@/lib/testMode";
import { addTestEnrollment, listTestEnrollmentsByStudent } from "@/lib/testStore";
import { createApiHandler } from "@/server/apiHandler";
import { withRouteTiming } from "@/server/withRouteTiming";
import { z } from "zod";
import { parseQuery } from "@/lib/zodQuery";

export const POST = withRouteTiming(createApiHandler({
  schema: enrollmentCreateRequest,
  handler: async (input, ctx) => {
    const supabase = getRouteHandlerSupabase();
    const requestId = ctx.requestId;
    const user = await getCurrentUserInRoute();
    if (!user) return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Not signed in" }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
    const role = (user.user_metadata as any)?.role ?? "student";
    if (role !== "student") return NextResponse.json({ error: { code: "FORBIDDEN", message: "Students only" }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
    const { course_id } = input!;

    if (isTestMode()) {
      const ts = Date.now().toString();
      const suffix = ts.slice(-12).padStart(12, '0');
      const row = { id: `cccccccc-cccc-cccc-cccc-${suffix}`, student_id: user.id, course_id, created_at: new Date().toISOString() };
      addTestEnrollment(row as any);
      try { return NextResponse.json(enrollment.parse(row), { status: 201 }); } catch { return NextResponse.json({ error: { code: 'INTERNAL', message: 'Invalid enrollment shape' }, requestId }, { status: 500, headers: { 'x-request-id': requestId } }); }
    }
    const { data, error } = await supabase
      .from("enrollments")
      .insert({ student_id: user.id, course_id })
      .select()
      .single();
    if (error) return NextResponse.json({ error: { code: "DB_ERROR", message: error.message } }, { status: 500 });
    try { return NextResponse.json(enrollment.parse(data as any), { status: 201 }); } catch { return NextResponse.json({ error: { code: 'INTERNAL', message: 'Invalid enrollment shape' }, requestId }, { status: 500, headers: { 'x-request-id': requestId } }); }
  }
}));

const listEnrollmentsQuery = z.object({ offset: z.string().optional(), limit: z.string().optional() }).strict();

export const GET = withRouteTiming(async function GET(req: NextRequest) {
  const supabase = getRouteHandlerSupabase();
  const user = await getCurrentUserInRoute(req);
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  if (!user) return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Not signed in" }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
  let q: { offset?: string; limit?: string };
  try { q = parseQuery(req, listEnrollmentsQuery); } catch (e: any) { return NextResponse.json({ error: { code: 'BAD_REQUEST', message: e.message }, requestId }, { status: 400, headers: { 'x-request-id': requestId } }); }
  const offset = Math.max(0, parseInt(q.offset || '0', 10) || 0);
  const limit = Math.max(1, Math.min(200, parseInt(q.limit || '50', 10) || 50));

  if (isTestMode()) {
    const all = listTestEnrollmentsByStudent(user.id) as any[];
    const rows = (all ?? []).slice(offset, offset + limit);
    try {
      const parsed = enrollmentListDto.parse(rows ?? []);
      return NextResponse.json(parsed, { status: 200, headers: { 'x-request-id': requestId, 'x-total-count': String((all ?? []).length) } });
    } catch {
      return NextResponse.json({ error: { code: 'INTERNAL', message: 'Invalid enrollment shape' }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
    }
  }
  const { data, error, count } = await supabase
    .from("enrollments")
    .select("id,student_id,course_id,created_at", { count: 'exact' as any })
    .eq("student_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) return NextResponse.json({ error: { code: "DB_ERROR", message: error.message }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
  try {
    const parsed = enrollmentListDto.parse((data ?? []).map(r => enrollment.parse(r as any)));
    const headers: Record<string, string> = { 'x-request-id': requestId };
    if (typeof count === 'number') headers['x-total-count'] = String(count);
    return NextResponse.json(parsed, { status: 200, headers });
  } catch {
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'Invalid enrollment shape' }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
  }
});


