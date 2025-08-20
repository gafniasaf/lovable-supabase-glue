/**
 * Modules API
 *
 * POST /api/modules — create a module (teacher only)
 * GET  /api/modules?course_id=... — list modules for a course (teacher)
 * PATCH /api/modules?id=... — update a module
 * DELETE /api/modules?id=... — delete a module
 */
// @ts-nocheck

import { NextResponse, NextRequest } from "next/server";
import { getRouteHandlerSupabase, getCurrentUserInRoute } from "@/lib/supabaseServer";
import { isTestMode } from "@/lib/testMode";
import { addTestModule, listTestModulesByCourse } from "@/lib/testStore";
import { createApiHandler } from "@/server/apiHandler";
import { withRouteTiming } from "@/server/withRouteTiming";
import { moduleSchema, moduleCreateRequest, moduleUpdateRequest } from "@education/shared";
import { createModuleApi, updateModuleApi, deleteModuleApi } from "@/server/services/modules";
import { z } from "zod";
import { parseQuery } from "@/lib/zodQuery";

export const POST = withRouteTiming(createApiHandler({
  schema: moduleCreateRequest,
  handler: async (input, ctx) => {
    const supabase = getRouteHandlerSupabase();
    const requestId = ctx.requestId;
    const user = await getCurrentUserInRoute();
    const role = (user?.user_metadata as any)?.role ?? undefined;
    if (!user) return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Not signed in" }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
    if (role !== "teacher") return NextResponse.json({ error: { code: "FORBIDDEN", message: "Teachers only" }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
    const data = await createModuleApi({ course_id: input!.course_id, title: input!.title, order_index: input!.order_index ?? 1 });
    try {
      const out = moduleSchema.parse(data);
      return NextResponse.json(out, { status: 201 });
    } catch {
      return NextResponse.json({ error: { code: 'INTERNAL', message: 'Invalid module shape' }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
    }
  }
}));

const listModulesQuery = z.object({ course_id: z.string().uuid(), offset: z.string().optional(), limit: z.string().optional() }).strict();

export const GET = withRouteTiming(async function GET(req: NextRequest) {
  const supabase = getRouteHandlerSupabase();
  const user = await getCurrentUserInRoute(req);
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  if (!user) {
    return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Not signed in" }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
  }
  const role = (user?.user_metadata as any)?.role ?? undefined;
  if (role !== "teacher") return NextResponse.json({ error: { code: "FORBIDDEN", message: "Teachers only" }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
  let q: { course_id: string; offset?: string; limit?: string };
  try {
    q = parseQuery(req, listModulesQuery);
  } catch (e: any) {
    return NextResponse.json({ error: { code: "BAD_REQUEST", message: e.message }, requestId }, { status: 400, headers: { 'x-request-id': requestId } });
  }
  const offset = Math.max(0, parseInt(q.offset || '0', 10) || 0);
  const limit = Math.max(1, Math.min(200, parseInt(q.limit || '100', 10) || 100));
  if (isTestMode()) {
    const all = listTestModulesByCourse(q.course_id);
    const rows = all.slice(offset, offset + limit);
    try {
      const parsed = (rows ?? []).map(r => moduleSchema.parse(r));
      return NextResponse.json(parsed, { status: 200, headers: { 'x-request-id': requestId, 'x-total-count': String((all ?? []).length) } });
    } catch {
      return NextResponse.json({ error: { code: 'INTERNAL', message: 'Invalid module shape' }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
    }
  }
  const { data, error, count } = await supabase
    .from("modules")
    .select("id,course_id,title,order_index,created_at", { count: 'exact' as any })
    .eq("course_id", q.course_id)
    .order("order_index", { ascending: true })
    .range(offset, offset + limit - 1);
  if (error) return NextResponse.json({ error: { code: "DB_ERROR", message: error.message }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
  try {
    const parsed = (data ?? []).map(r => moduleSchema.parse(r));
    const headers: Record<string, string> = { 'x-request-id': requestId };
    if (typeof count === 'number') headers['x-total-count'] = String(count);
    return NextResponse.json(parsed, { status: 200, headers });
  } catch {
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'Invalid module shape' }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
  }
});

export const PATCH = withRouteTiming(async function PATCH(req: NextRequest) {
  const supabase = getRouteHandlerSupabase();
  const user = await getCurrentUserInRoute();
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  if (!user) return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Not signed in" }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
  const role = (user?.user_metadata as any)?.role ?? undefined;
  if (role !== "teacher") return NextResponse.json({ error: { code: "FORBIDDEN", message: "Teachers only" }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
  const idSchema = z.object({ id: z.string().uuid() }).strict();
  let q: { id: string };
  try { q = parseQuery(req, idSchema); } catch (e: any) { return NextResponse.json({ error: { code: 'BAD_REQUEST', message: e.message }, requestId }, { status: 400, headers: { 'x-request-id': requestId } }); }
  const body = await req.json().catch(() => ({}));
  const parsed = moduleUpdateRequest.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: { code: "BAD_REQUEST", message: parsed.error.message }, requestId }, { status: 400, headers: { 'x-request-id': requestId } });
  const data = await updateModuleApi(q.id, parsed.data);
  try {
    const out = moduleSchema.parse(data);
    return NextResponse.json(out, { status: 200 });
  } catch {
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'Invalid module shape' }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
  }
});

export const DELETE = withRouteTiming(createApiHandler({
  handler: async (_input, ctx) => {
    const req = ctx.req as NextRequest;
    const requestId = ctx.requestId;
    const user = await getCurrentUserInRoute(req);
    if (!user) return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Not signed in" }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
    const role = (user?.user_metadata as any)?.role ?? undefined;
    if (role !== "teacher") return NextResponse.json({ error: { code: "FORBIDDEN", message: "Teachers only" }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: { code: "BAD_REQUEST", message: "id is required" }, requestId }, { status: 400, headers: { 'x-request-id': requestId } });
    try {
      const { checkRateLimit } = await import('@/lib/rateLimit');
      const rl = checkRateLimit(`module:del:${user.id}`, 30, 60000);
      if (!(rl as any).allowed) {
        const retry = Math.max(0, (rl as any).resetAt - Date.now());
        return NextResponse.json(
          { error: { code: 'TOO_MANY_REQUESTS', message: 'Rate limit' }, requestId },
          {
            status: 429,
            headers: {
              'x-request-id': requestId,
              'retry-after': String(Math.ceil(retry / 1000)),
              'x-rate-limit-remaining': String((rl as any).remaining),
              'x-rate-limit-reset': String(Math.ceil((rl as any).resetAt / 1000))
            }
          }
        );
      }
    } catch {}
    const data = await deleteModuleApi(id);
    try {
      const supabase = getRouteHandlerSupabase();
      await supabase.from('audit_logs').insert({ actor_id: user.id, action: 'module.delete', entity_type: 'module', entity_id: id, details: {} });
    } catch {}
    try {
      const out = moduleSchema.parse(data);
      return NextResponse.json(out, { status: 200, headers: { 'x-request-id': requestId } });
    } catch {
      return NextResponse.json({ error: { code: 'INTERNAL', message: 'Invalid module shape' }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
    }
  }
}));


