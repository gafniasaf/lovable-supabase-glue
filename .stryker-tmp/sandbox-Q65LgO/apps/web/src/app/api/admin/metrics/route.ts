// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { withRouteTiming } from "@/server/withRouteTiming";
import { snapshot, getCounters } from "@/lib/metrics";
import { getCurrentUserInRoute } from "@/lib/supabaseServer";

export const GET = withRouteTiming(async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const user = await getCurrentUserInRoute(req);
  const role = (user?.user_metadata as any)?.role ?? undefined;
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Not signed in' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
  if (role !== 'admin') return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Admins only' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
  const accept = req.headers.get('accept') || '';
  const json = { timings: snapshot(), counters: getCounters() };
  try {
    const { getRouteHandlerSupabase } = await import('@/lib/supabaseServer');
    const supabase = getRouteHandlerSupabase();
    await supabase.from('audit_logs').insert({ actor_id: user.id, action: 'admin.metrics.view', entity_type: 'metrics', entity_id: null, details: {} });
  } catch {}
  if (accept.includes('text/plain')) {
    // Expose minimal Prometheus-style metrics
    const lines: string[] = [];
    const timings = json.timings as Record<string, any>;
    for (const [route, v] of Object.entries(timings)) {
      lines.push(`app_route_timing_count{route="${route}"} ${v.count}`);
      lines.push(`app_route_timing_p50_ms{route="${route}"} ${v.p50}`);
      lines.push(`app_route_timing_p95_ms{route="${route}"} ${v.p95}`);
      lines.push(`app_route_timing_p99_ms{route="${route}"} ${v.p99}`);
      lines.push(`app_route_errors_total{route="${route}"} ${v.errors}`);
      lines.push(`app_route_in_flight{route="${route}"} ${v.in_flight}`);
    }
    const counters = json.counters as Record<string, number>;
    for (const [k, v] of Object.entries(counters)) {
      lines.push(`app_counter_total{name="${k}"} ${v}`);
    }
    return new NextResponse(lines.join('\n') + '\n', { status: 200, headers: { 'content-type': 'text/plain; version=0.0.4', 'x-request-id': requestId } });
  }
  return NextResponse.json(json, { status: 200, headers: { 'x-request-id': requestId } });
});


