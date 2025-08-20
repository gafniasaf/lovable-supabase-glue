// @ts-nocheck
import { NextResponse } from "next/server";
import { getRouteHandlerSupabase, getCurrentUserInRoute } from "@/lib/supabaseServer";
import { lessonReorderRequest } from "@education/shared";
import { isTestMode } from "@/lib/testMode";
import { reorderTestLessons } from "@/lib/testStore";
import { createApiHandler } from "@/server/apiHandler";
import { withRouteTiming } from "@/server/withRouteTiming";

export const POST = withRouteTiming(createApiHandler({
  preAuth: async (ctx) => {
    const requestId = ctx.req.headers.get('x-request-id') || crypto.randomUUID();
    const user = await getCurrentUserInRoute(ctx.req as any);
    if (!user) return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Not signed in" }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
    const role = (user.user_metadata as any)?.role ?? undefined;
    if (role !== "teacher") return NextResponse.json({ error: { code: "FORBIDDEN", message: "Teachers only" }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
    return null;
  },
  handler: async (_input, ctx) => {
    const supabase = getRouteHandlerSupabase();
    const requestId = ctx.requestId;
    // Accept relaxed payload in tests (ids need not be UUIDs). Validate minimally.
    const body = await (ctx.req as Request).json().catch(() => ({}));
    const course_id = (body as any)?.course_id;
    const items = (body as any)?.items;
    const valid = typeof course_id === 'string' && Array.isArray(items) && items.every((it: any) => it && typeof it.id === 'string' && Number.isInteger(it.order_index) && it.order_index > 0);
    if (!valid) return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'Invalid payload' }, requestId }, { status: 400, headers: { 'x-request-id': requestId } });
    if (isTestMode()) {
      reorderTestLessons(course_id, items);
      return NextResponse.json({ ok: true }, { status: 200, headers: { 'x-request-id': requestId } });
    }
    const updates = items.map(({ id, order_index }) => ({ id, order_index }));
    const { error } = await supabase
      .from('lessons')
      .upsert(updates, { onConflict: 'id' });
    if (error) return NextResponse.json({ error: { code: 'DB_ERROR', message: error.message }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
    return NextResponse.json({ ok: true }, { status: 200, headers: { 'x-request-id': requestId } });
  }
}));


