// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { withRouteTiming } from "@/server/withRouteTiming";
import { getCurrentUserInRoute, getRouteHandlerSupabase } from "@/lib/supabaseServer";

export const GET = withRouteTiming(async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const user = await getCurrentUserInRoute(req);
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Not signed in' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
  const role = (user?.user_metadata as any)?.role ?? undefined;
  if (role !== 'teacher') return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Teachers only' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
  const supabase = getRouteHandlerSupabase();
  const { data: courses, error: cErr } = await supabase.from('courses').select('id').eq('teacher_id', user.id);
  if (cErr) return NextResponse.json({ error: { code: 'DB_ERROR', message: cErr.message }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
  const courseIds = (courses ?? []).map((c: any) => c.id);
  if (courseIds.length === 0) return NextResponse.json([], { status: 200, headers: { 'x-request-id': requestId } });
  const { data, error, count } = await supabase
    .from('interactive_attempts')
    .select('id,course_id,user_id,score,max,passed,pct,topic,created_at', { count: 'exact' as any })
    .in('course_id', courseIds)
    .order('created_at', { ascending: false })
    .limit(10);
  if (error) return NextResponse.json({ error: { code: 'DB_ERROR', message: error.message }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
  const headers: Record<string, string> = { 'x-request-id': requestId };
  if (typeof count === 'number') headers['x-total-count'] = String(count);
  return NextResponse.json(data ?? [], { status: 200, headers });
});


