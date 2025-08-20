import { NextRequest, NextResponse } from "next/server";
import { withRouteTiming } from "@/server/withRouteTiming";
import { getCurrentUserInRoute, getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { z } from "zod";
import { jsonDto } from "@/lib/jsonDto";
import { parseQuery } from "@/lib/zodQuery";

async function deleteAttachmentByKey(req: NextRequest, key: string, requestId: string) {
  const user = await getCurrentUserInRoute(req);
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Not signed in' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
  const supabase = getRouteHandlerSupabase();
  const { data: att } = await supabase.from('attachments').select('bucket,object_key,owner_id,owner_type').eq('object_key', key).single();
  if (!att) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'not found' }, requestId }, { status: 404, headers: { 'x-request-id': requestId } });
  if ((att as any).owner_id !== user.id) {
    if ((att as any).owner_type === 'submission') {
      // Teacher of course where submission belongs may delete
      let allowed = false;
      const { data: subs } = await supabase.from('submissions').select('id,assignment_id,student_id,file_url,file_urls');
      for (const s of (subs ?? []) as any[]) {
        const match = s.file_url === key || (Array.isArray(s.file_urls) && s.file_urls.includes(key));
        if (!match) continue;
        const { data: asg } = await supabase.from('assignments').select('course_id').eq('id', s.assignment_id).single();
        if (!asg) continue;
        const { data: crs } = await supabase.from('courses').select('teacher_id').eq('id', (asg as any).course_id).single();
        if (crs && (crs as any).teacher_id === user.id) { allowed = true; break; }
      }
      if (!allowed) return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Not allowed' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
    } else if ((att as any).owner_type === 'lesson' || (att as any).owner_type === 'announcement') {
      const courseId = (att as any).owner_id as string;
      const { data: crs } = await supabase.from('courses').select('teacher_id').eq('id', courseId).single();
      if (!crs || (crs as any).teacher_id !== user.id) return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Not allowed' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
    } else {
      return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Not allowed' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
    }
  }
  try {
    const bucket = (att as any).bucket as string;
    const object_key = (att as any).object_key as string;
    await (supabase as any).storage.from(bucket).remove([object_key]);
  } catch {}
  await supabase.from('attachments').delete().eq('object_key', key);
  return jsonDto({ ok: true } as any, z.object({ ok: z.boolean() }) as any, { requestId, status: 200 });
}

export const DELETE = withRouteTiming(async function DELETE(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const qSchema = z.object({ key: z.string().min(1) }).strict();
  let q: { key: string };
  try { q = parseQuery(req, qSchema); } catch (e: any) { return NextResponse.json({ error: { code: 'BAD_REQUEST', message: e.message }, requestId }, { status: 400, headers: { 'x-request-id': requestId } }); }
  return deleteAttachmentByKey(req, q.key, requestId);
});

export const POST = withRouteTiming(async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const url = new URL(req.url);
  const method = url.searchParams.get('_method') || 'POST';
  if (method.toUpperCase() === 'DELETE') {
    const qSchema = z.object({ key: z.string().min(1) }).strict();
    let q: { key: string };
    try { q = parseQuery(req, qSchema); } catch (e: any) { return NextResponse.json({ error: { code: 'BAD_REQUEST', message: e.message }, requestId }, { status: 400, headers: { 'x-request-id': requestId } }); }
    return deleteAttachmentByKey(req, q.key, requestId);
  }
  return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'Unsupported' }, requestId }, { status: 400, headers: { 'x-request-id': requestId } });
});


