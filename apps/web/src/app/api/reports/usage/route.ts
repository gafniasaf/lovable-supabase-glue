import { NextRequest, NextResponse } from "next/server";
import { withRouteTiming } from "@/server/withRouteTiming";
import { getCurrentUserInRoute, getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { jsonDto } from "@/lib/jsonDto";
import { z } from "zod";

function toCsv(rows: any[]): string {
  const headers = ["day","metric","course_id","provider_id","count","storage_bytes","compute_minutes"];
  const lines = [headers.join(",")];
  for (const r of rows) {
    const vals = headers.map(h => {
      const v = (r as any)[h];
      if (v == null) return "";
      const s = String(v).replace(/"/g, '""');
      return /[",\n]/.test(s) ? `"${s}"` : s;
    });
    lines.push(vals.join(","));
  }
  return lines.join("\n");
}

export const GET = withRouteTiming(async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const user = await getCurrentUserInRoute(req);
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Not signed in' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
  const role = (user?.user_metadata as any)?.role ?? undefined;
  if (role !== 'admin') return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Admins only' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
  const qSchema = z.object({
    from: z.string().optional(),
    to: z.string().optional(),
    metric: z.string().optional(),
    course_id: z.string().uuid().optional(),
    provider_id: z.string().uuid().optional(),
    format: z.enum(["json","csv"]).optional()
  }).strict();
  let q: z.infer<typeof qSchema>;
  try { q = qSchema.parse(Object.fromEntries(new URL(req.url).searchParams.entries())); } catch (e: any) {
    return NextResponse.json({ error: { code: 'BAD_REQUEST', message: String(e?.message || e) }, requestId }, { status: 400, headers: { 'x-request-id': requestId } });
  }
  // Test-mode stub
  try {
    const { isTestMode } = await import('@/lib/testMode');
    if (isTestMode()) {
      const day = new Date().toISOString().slice(0,10);
      const rows = [
        { day, metric: 'runtime.progress', course_id: null, provider_id: null, count: 10, storage_bytes: 0, compute_minutes: 0 },
        { day, metric: 'runtime.grade', course_id: null, provider_id: null, count: 3, storage_bytes: 0, compute_minutes: 0 }
      ];
      if (q.format === 'csv') {
        const csv = toCsv(rows);
        return new NextResponse(csv, { status: 200, headers: { 'content-type': 'text/csv; charset=utf-8', 'x-request-id': requestId } });
      }
      const dto = z.object({ rows: z.array(z.object({ day: z.string(), metric: z.string(), course_id: z.string().uuid().nullable().optional(), provider_id: z.string().uuid().nullable().optional(), count: z.number(), storage_bytes: z.number(), compute_minutes: z.number() })) });
      return jsonDto({ rows } as any, dto as any, { requestId, status: 200 });
    }
  } catch {}
  const supabase = getRouteHandlerSupabase();
  let query = supabase.from('usage_counters').select('*').order('day', { ascending: false }) as any;
  if (q.from) query = query.gte('day', q.from);
  if (q.to) query = query.lte('day', q.to);
  if (q.metric) query = query.eq('metric', q.metric);
  if (q.course_id) query = query.eq('course_id', q.course_id);
  if (q.provider_id) query = query.eq('provider_id', q.provider_id);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: { code: 'DB_ERROR', message: error.message }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
  if (q.format === 'csv') {
    const csv = toCsv(data ?? []);
    return new NextResponse(csv, { status: 200, headers: { 'content-type': 'text/csv; charset=utf-8', 'x-request-id': requestId } });
  }
  const dto = z.object({ rows: z.array(z.object({ day: z.string(), metric: z.string(), course_id: z.string().uuid().nullable().optional(), provider_id: z.string().uuid().nullable().optional(), count: z.number().nullable().optional(), storage_bytes: z.number().nullable().optional(), compute_minutes: z.number().nullable().optional() })) });
  return jsonDto({ rows: data ?? [] } as any, dto as any, { requestId, status: 200 });
});


