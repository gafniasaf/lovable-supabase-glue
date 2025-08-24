/**
 * Modules API
 *
 * POST /api/modules — create a module (teacher only)
 * GET  /api/modules?course_id=... — list modules for a course (teacher)
 * PATCH /api/modules?id=... — update a module
 * DELETE /api/modules?id=... — delete a module
 */
import { NextResponse, NextRequest } from "next/server";
import { getRouteHandlerSupabase, getCurrentUserInRoute } from "@/lib/supabaseServer";
import { isTestMode } from "@/lib/testMode";
import { addTestModule, listTestModulesByCourse } from "@/lib/testStore";
import { createApiHandler } from "@/server/apiHandler";
import { withRouteTiming } from "@/server/withRouteTiming";
import { moduleSchema, moduleCreateRequest, moduleUpdateRequest } from "@education/shared";
import { moduleDto, moduleListDto } from "@education/shared";
import { jsonDto } from "@/lib/jsonDto";
import { createModuleApi, updateModuleApi, deleteModuleApi } from "@/server/services/modules";
import { z } from "zod";
import { parseQuery } from "@/lib/zodQuery";
import { recordEvent } from "@/lib/events";

export const POST = withRouteTiming(createApiHandler({
  schema: moduleCreateRequest,
  preAuth: async (ctx) => {
    const user = await getCurrentUserInRoute(ctx.req as any);
    const role = (user?.user_metadata as any)?.role ?? undefined;
    if (!user) return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Not signed in" }, requestId: ctx.requestId }, { status: 401, headers: { 'x-request-id': ctx.requestId } });
    if (role !== "teacher") return NextResponse.json({ error: { code: "FORBIDDEN", message: "Teachers only" }, requestId: ctx.requestId }, { status: 403, headers: { 'x-request-id': ctx.requestId } });
    return null;
  },
  handler: async (input, ctx) => {
    const supabase = getRouteHandlerSupabase();
    const requestId = ctx.requestId;
    const data = await createModuleApi({ course_id: input!.course_id, title: input!.title, order_index: input!.order_index ?? 1 });
    try {
      try { await recordEvent({ user_id: (await getCurrentUserInRoute(ctx.req as any))!.id, event_type: 'module.create', entity_type: 'course', entity_id: input!.course_id, meta: { module_id: (data as any)?.id } }); } catch {}
      const out = moduleSchema.parse(data);
      return jsonDto(out, moduleDto as any, { requestId, status: 201 });
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
      const res = jsonDto(parsed, moduleListDto as any, { requestId, status: 200 });
      res.headers.set('x-total-count', String((all ?? []).length));
      return res;
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
    const res = jsonDto(parsed, moduleListDto as any, { requestId, status: 200 });
    if (typeof count === 'number') res.headers.set('x-total-count', String(count));
    return res;
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
    return jsonDto(out, moduleDto as any, { requestId, status: 200 });
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
      try { await recordEvent({ user_id: user.id, event_type: 'module.delete', entity_type: 'module', entity_id: id }); } catch {}
      const out = moduleSchema.parse(data);
      return jsonDto(out, moduleDto as any, { requestId, status: 200 });
    } catch {
      return NextResponse.json({ error: { code: 'INTERNAL', message: 'Invalid module shape' }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
    }
  }
}));


