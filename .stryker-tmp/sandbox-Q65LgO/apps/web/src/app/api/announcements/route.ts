/**
 * Announcements API (MVP)
 *
 * POST /api/announcements — teacher creates announcement
 * GET  /api/announcements?course_id=... — list announcements for a course (auth required)
 * DELETE /api/announcements?id=... — teacher deletes announcement
 */
// @ts-nocheck

import { NextRequest, NextResponse } from "next/server";
import { withRouteTiming } from "@/server/withRouteTiming";
import { createApiHandler } from "@/server/apiHandler";
import { announcementCreateRequest, announcement } from "@education/shared";
import { getCurrentUserInRoute } from "@/lib/supabaseServer";
import { createAnnouncementApi, listAnnouncementsByCourse, deleteAnnouncementApi } from "@/server/services/announcements";
import { z } from "zod";
import { parseQuery } from "@/lib/zodQuery";
import { checkRateLimit } from "@/lib/rateLimit";

export const POST = withRouteTiming(createApiHandler({
  schema: announcementCreateRequest,
  handler: async (input, ctx) => {
    const requestId = ctx.requestId;
    const user = await getCurrentUserInRoute();
    const role = (user?.user_metadata as any)?.role;
    if (!user) return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Not signed in" }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
    if (role !== "teacher") return NextResponse.json({ error: { code: "FORBIDDEN", message: "Teachers only" }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
    // Small per-teacher write rate limit
    try {
      const rl = checkRateLimit(`ann:create:${user.id}`, 60, 60000);
      if (!(rl as any).allowed) {
        const retry = Math.max(0, rl.resetAt - Date.now());
        return NextResponse.json(
          { error: { code: 'TOO_MANY_REQUESTS', message: 'Rate limit' }, requestId },
          {
            status: 429,
            headers: {
              'x-request-id': requestId,
              'retry-after': String(Math.ceil(retry / 1000)),
              'x-rate-limit-remaining': String(rl.remaining),
              'x-rate-limit-reset': String(Math.ceil(rl.resetAt / 1000))
            }
          }
        );
      }
    } catch {}
    const data = await createAnnouncementApi(input!, user.id);
    return NextResponse.json(data, { status: 201 });
  }
}));

const listQuery = z.object({ course_id: z.string().uuid(), include_unpublished: z.union([z.literal('1'), z.literal('0')]).optional() }).strict();

export const GET = withRouteTiming(async function GET(req: NextRequest) {
  const user = await getCurrentUserInRoute(req);
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  if (!user) return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Not signed in" }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
  let q: z.infer<typeof listQuery>;
  try {
    q = parseQuery(req, listQuery);
  } catch (err: any) {
    return NextResponse.json({ error: { code: 'BAD_REQUEST', message: err?.message || 'Invalid query' }, requestId }, { status: 400, headers: { 'x-request-id': requestId } });
  }
  const showAll = q.include_unpublished === '1';
  const rows = await listAnnouncementsByCourse(q.course_id, showAll);
  try {
    const parsed = (rows ?? []).map(r => announcement.parse(r));
    return NextResponse.json(parsed, { status: 200, headers: { 'x-request-id': requestId } });
  } catch {
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'Invalid announcement shape' }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
  }
});

const delQuery = z.object({ id: z.string().uuid() }).strict();

export const DELETE = withRouteTiming(async function DELETE(req: NextRequest) {
  const user = await getCurrentUserInRoute(req);
  const role = (user?.user_metadata as any)?.role;
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  if (!user) return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Not signed in" }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
  if (role !== "teacher") return NextResponse.json({ error: { code: "FORBIDDEN", message: "Teachers only" }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
  let q: z.infer<typeof delQuery>;
  try {
    q = parseQuery(req, delQuery);
  } catch (err: any) {
    return NextResponse.json({ error: { code: 'BAD_REQUEST', message: err?.message || 'Invalid query' }, requestId }, { status: 400, headers: { 'x-request-id': requestId } });
  }
  try {
    const { checkRateLimit } = await import('@/lib/rateLimit');
    const rl = checkRateLimit(`ann:del:${user.id}`, 30, 60000);
    if (!(rl as any).allowed) {
      const retry = Math.max(0, rl.resetAt - Date.now());
      return NextResponse.json(
        { error: { code: 'TOO_MANY_REQUESTS', message: 'Rate limit' }, requestId },
        {
          status: 429,
          headers: {
            'x-request-id': requestId,
            'retry-after': String(Math.ceil(retry / 1000)),
            'x-rate-limit-remaining': String(rl.remaining),
            'x-rate-limit-reset': String(Math.ceil(rl.resetAt / 1000))
          }
        }
      );
    }
  } catch {}
  const data = await deleteAnnouncementApi(q.id);
  try {
    const { getRouteHandlerSupabase } = await import('@/lib/supabaseServer');
    const supabase = getRouteHandlerSupabase();
    await supabase.from('audit_logs').insert({ actor_id: user.id, action: 'announcement.delete', entity_type: 'announcement', entity_id: q.id, details: {} });
  } catch {}
  return NextResponse.json(data, { status: 200, headers: { 'x-request-id': requestId } });
});


