// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { withRouteTiming } from "@/server/withRouteTiming";
import { getCurrentUserInRoute, getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { z } from "zod";
import { parseQuery } from "@/lib/zodQuery";

function toCSV(rows: any[]): string {
  if (!Array.isArray(rows) || rows.length === 0) return '';
  const headers = Array.from(new Set(rows.flatMap((r: any) => Object.keys(r))));
  const escape = (v: any) => {
    if (v == null) return '';
    const s = typeof v === 'string' ? v : JSON.stringify(v);
    const needsQuotes = /[",\n]/.test(s);
    const q = s.replace(/"/g, '""');
    return needsQuotes ? `"${q}"` : q;
  };
  const lines = [headers.join(',')];
  for (const r of rows) lines.push(headers.map(h => escape((r as any)[h])).join(','));
  return lines.join('\n');
}

export const GET = withRouteTiming(async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const user = await getCurrentUserInRoute(req);
  const role = (user?.user_metadata as any)?.role ?? undefined;
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Not signed in' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
  if (role !== 'admin') return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Admins only' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
  const qSchema = z.object({ entity: z.string().min(1), format: z.string().optional() }).strict();
  let q: { entity: string; format?: string };
  try {
    q = parseQuery(req, qSchema);
  } catch (e: any) {
    return NextResponse.json({ error: { code: 'BAD_REQUEST', message: e.message }, requestId }, { status: 400, headers: { 'x-request-id': requestId } });
  }
  const entity = (q.entity || '').toLowerCase();
  const format = ((q.format || 'csv') as string).toLowerCase();
  const supabase = getRouteHandlerSupabase();
  let rows: any[] = [];
  try {
    if (entity === 'profiles') {
      const { data } = await supabase.from('profiles').select('*').limit(5000);
      rows = data ?? [];
    } else if (entity === 'courses') {
      const { data } = await supabase.from('courses').select('*').limit(5000);
      rows = data ?? [];
    } else if (entity === 'assignments') {
      const { data } = await supabase.from('assignments').select('*').limit(5000);
      rows = data ?? [];
    } else if (entity === 'submissions') {
      const { data } = await supabase.from('submissions').select('*').limit(5000);
      rows = data ?? [];
    } else if (entity === 'notifications') {
      const { data } = await supabase.from('notifications').select('*').limit(5000);
      rows = data ?? [];
    } else if (entity === 'events') {
      const { data } = await supabase.from('events').select('*').limit(5000);
      rows = data ?? [];
    } else if (entity === 'messages') {
      const { data } = await supabase.from('messages').select('*').limit(5000);
      rows = data ?? [];
    } else {
      return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'Unsupported entity' }, requestId }, { status: 400, headers: { 'x-request-id': requestId } });
    }
  } catch (e: any) {
    return NextResponse.json({ error: { code: 'DB_ERROR', message: String(e?.message || e) }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
  }
  try { await supabase.from('audit_logs').insert({ actor_id: user.id, action: 'admin.export', entity_type: 'export', entity_id: entity, details: { format } }); } catch {}
  if (format === 'json') {
    return NextResponse.json(rows, { status: 200, headers: { 'x-request-id': requestId } });
  }
  const csv = toCSV(rows);
  const filename = `${entity}-${new Date().toISOString().replace(/[:.]/g, '-')}.csv`;
  // Use Response constructor for broad TS compatibility
  return new Response(csv, { status: 200, headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="${filename}"`, 'x-request-id': requestId } });
});


