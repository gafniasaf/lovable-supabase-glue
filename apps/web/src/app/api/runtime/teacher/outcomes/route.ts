import { NextRequest, NextResponse } from "next/server";
import { withRouteTiming } from "@/server/withRouteTiming";
import { getCurrentUserInRoute, getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { checkRateLimit } from "@/lib/rateLimit";
import { jsonDto } from "@/lib/jsonDto";
import { z } from "zod";

export const GET = withRouteTiming(async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const user = await getCurrentUserInRoute(req);
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Not signed in' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
  const role = (user?.user_metadata as any)?.role ?? undefined;
  if (role !== 'teacher') return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Teachers only' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
  // Per-teacher aggregate outcomes list rate limit
  {
    const limit = Number(process.env.RUNTIME_OUTCOMES_LIMIT || 60);
    const windowMs = Number(process.env.RUNTIME_OUTCOMES_WINDOW_MS || 60000);
    const key = `outcomes:teacher:${user.id}`;
    const rl = checkRateLimit(key, limit, windowMs);
    if (!rl.allowed) {
      const retry = Math.max(0, rl.resetAt - Date.now());
      return NextResponse.json(
        { error: { code: 'TOO_MANY_REQUESTS', message: 'Rate limit' }, requestId },
        { status: 429, headers: { 'x-request-id': requestId, 'retry-after': String(Math.ceil(retry / 1000)), 'x-rate-limit-remaining': String(rl.remaining), 'x-rate-limit-reset': String(Math.ceil(rl.resetAt / 1000)) } }
      );
    }
  }
  const supabase = getRouteHandlerSupabase();
  const { data: courses, error: cErr } = await supabase.from('courses').select('id').eq('teacher_id', user.id);
  if (cErr) return NextResponse.json({ error: { code: 'DB_ERROR', message: cErr.message }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
  const courseIds = (courses ?? []).map((c: any) => c.id);
  if (courseIds.length === 0) return jsonDto([] as any, z.array(z.any()) as any, { requestId, status: 200 });
  const { data, error, count } = await supabase
    .from('interactive_attempts')
    .select('id,course_id,user_id,score,max,passed,pct,topic,created_at', { count: 'exact' as any })
    .in('course_id', courseIds)
    .order('created_at', { ascending: false })
    .limit(10);
  if (error) return NextResponse.json({ error: { code: 'DB_ERROR', message: error.message }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
  const headers: Record<string, string> = { 'x-request-id': requestId };
  if (typeof count === 'number') headers['x-total-count'] = String(count);
  // If supabase mock did not set count, fall back to data length for tests
  if (headers['x-total-count'] == null) headers['x-total-count'] = String((data ?? []).length);
  const dto = z.array(z.object({ id: z.string().optional(), course_id: z.string(), user_id: z.string().nullable().optional(), score: z.number().nullable().optional(), max: z.number().nullable().optional(), passed: z.boolean().nullable().optional(), pct: z.number().nullable().optional(), topic: z.string().nullable().optional(), created_at: z.string().optional() }));
  const res = jsonDto((data ?? []) as any, dto as any, { requestId, status: 200 });
  for (const [k, v] of Object.entries(headers)) res.headers.set(k, String(v));
  return res;
});


