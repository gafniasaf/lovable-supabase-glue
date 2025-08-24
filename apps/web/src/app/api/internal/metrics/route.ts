import { NextRequest, NextResponse } from "next/server";
import { withRouteTiming } from "@/server/withRouteTiming";
import { snapshot, getCounters } from "@/lib/metrics";

export const runtime = 'nodejs';
export const GET = withRouteTiming(async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const token = req.headers.get('x-metrics-token') || '';
  const expected = process.env.METRICS_TOKEN || '';
  if (!expected || token !== expected) {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'invalid token' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
  }
  const timings = snapshot();
  const counters = getCounters();
  const lines: string[] = [];
  for (const [route, v] of Object.entries(timings)) {
    lines.push(`app_route_timing_count{route="${route}"} ${v.count}`);
    lines.push(`app_route_timing_p50_ms{route="${route}"} ${v.p50}`);
    lines.push(`app_route_timing_p95_ms{route="${route}"} ${v.p95}`);
    lines.push(`app_route_timing_p99_ms{route="${route}"} ${v.p99}`);
    lines.push(`app_route_errors_total{route="${route}"} ${v.errors}`);
    lines.push(`app_route_in_flight{route="${route}"} ${v.in_flight}`);
  }
  for (const [k, v] of Object.entries(counters)) {
    lines.push(`app_counter_total{name="${k}"} ${v}`);
  }
  return new NextResponse(lines.join('\n') + '\n', { status: 200, headers: { 'content-type': 'text/plain; version=0.0.4', 'x-request-id': requestId } });
});

export const dynamic = 'force-dynamic';


