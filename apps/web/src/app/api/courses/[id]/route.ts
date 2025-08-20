/**
 * Course by id API
 *
 * PATCH /api/courses/[id] — update fields on a course (teacher)
 * DELETE /api/courses/[id] — delete a course (teacher)
 */
import { NextResponse, NextRequest } from "next/server";
import { getRouteHandlerSupabase, getCurrentUserInRoute } from "@/lib/supabaseServer";
import { courseUpdateRequest } from "@education/shared";
import { isTestMode } from "@/lib/testMode";
import { getTestCourse, addTestCourse, deleteTestCourse } from "@/lib/testStore";
import { withRouteTiming } from "@/server/withRouteTiming";
import { jsonDto } from "@/lib/jsonDto";
import { z } from "zod";

export const PATCH = withRouteTiming(async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  const supabase = getRouteHandlerSupabase();
  const user = await getCurrentUserInRoute(req);
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Not signed in' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
  const role = (user.user_metadata as any)?.role ?? undefined;
  if (role !== 'teacher') return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Teachers only' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });

  const body = await req.json().catch(() => ({}));
  const parsed = courseUpdateRequest.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: { code: 'BAD_REQUEST', message: parsed.error.message }, requestId }, { status: 400, headers: { 'x-request-id': requestId } });

  if (isTestMode()) {
    const current = getTestCourse(id);
    if (!current) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Course not found' }, requestId }, { status: 404, headers: { 'x-request-id': requestId } });
    const updated = { ...current, ...parsed.data } as any;
    addTestCourse(updated);
    return jsonDto(updated as any, z.object({ id: z.string().uuid() }).passthrough() as any, { requestId, status: 200 });
  }
  const { data, error } = await supabase
    .from('courses')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: { code: 'DB_ERROR', message: error.message }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
  if (!data) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Course not found' }, requestId }, { status: 404, headers: { 'x-request-id': requestId } });
  return jsonDto(data as any, z.object({ id: z.string().uuid() }).passthrough() as any, { requestId, status: 200 });
});

export const DELETE = withRouteTiming(async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  const supabase = getRouteHandlerSupabase();
  const user = await getCurrentUserInRoute(_req);
  const requestId = _req.headers.get('x-request-id') || crypto.randomUUID();
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Not signed in' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
  const role = (user.user_metadata as any)?.role ?? undefined;
  if (role !== 'teacher') return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Teachers only' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });

  if (isTestMode()) {
    deleteTestCourse(id);
    return jsonDto({ ok: true } as any, z.object({ ok: z.boolean() }) as any, { requestId, status: 200 });
  }
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id);
  if (error) return NextResponse.json({ error: { code: 'DB_ERROR', message: error.message }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
  return jsonDto({ ok: true } as any, z.object({ ok: z.boolean() }) as any, { requestId, status: 200 });
});


