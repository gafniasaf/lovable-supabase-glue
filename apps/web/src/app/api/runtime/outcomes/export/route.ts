import { NextRequest, NextResponse } from "next/server";
import { withRouteTiming } from "@/server/withRouteTiming";
import { getCurrentUserInRoute, getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { z } from "zod";
import { parseQuery } from "@/lib/zodQuery";

function toCsv(rows: any[]): string {
  const headers = ["id","course_id","user_id","score","max","passed","pct","topic","created_at"];
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
  const qSchema = z.object({ course_id: z.string().uuid() }).strict();
  let q: { course_id: string };
  try { q = parseQuery(req, qSchema); } catch (e: any) { return NextResponse.json({ error: { code: 'BAD_REQUEST', message: e.message }, requestId }, { status: 400, headers: { 'x-request-id': requestId } }); }
  const supabase = getRouteHandlerSupabase();
  // Authorization: teacher of the course only
  const { data: c } = await supabase.from('courses').select('teacher_id').eq('id', q.course_id).single();
  if (!c || (c as any).teacher_id !== user.id) return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Not your course' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
  const { data, error } = await supabase
    .from('interactive_attempts')
    .select('id,course_id,user_id,score,max,passed,pct,topic,created_at')
    .eq('course_id', q.course_id)
    .order('created_at', { ascending: false })
    .limit(10000);
  if (error) return NextResponse.json({ error: { code: 'DB_ERROR', message: error.message }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
  const csv = toCsv(data ?? []);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="interactive_attempts_${q.course_id}.csv"`,
      'x-request-id': requestId
    }
  });
});


