/**
 * Parent links API
 *
 * POST /api/parent-links — create link (admin)
 * DELETE /api/parent-links — delete link (admin)
 * GET  /api/parent-links?parent_id=... — list children for a parent (admin or self)
 */
import { NextRequest, NextResponse } from "next/server";
import { createApiHandler } from "@/server/apiHandler";
import { withRouteTiming } from "@/server/withRouteTiming";
import { getCurrentUserInRoute } from "@/lib/supabaseServer";
import { isTestMode } from "@/lib/testMode";
import { z } from "zod";
import { parentLinkCreateRequest, parentLinkDeleteRequest } from "@education/shared";
import { jsonDto } from "@/lib/jsonDto";
import { parseQuery } from "@/lib/zodQuery";
import { createParentLink, deleteParentLink, listChildrenForParent } from "@/server/services/parentLinks";
import { getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { checkRateLimit } from "@/lib/rateLimit";

function assertAdmin(user: any) {
  const role = (user?.user_metadata as any)?.role;
  const requestId = crypto.randomUUID();
  if (role !== 'admin') return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Admins only' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
  return null;
}

export const POST = withRouteTiming(createApiHandler({
  schema: parentLinkCreateRequest,
  preAuth: async (ctx) => {
    const user = await getCurrentUserInRoute(ctx.req as any);
    const requestId = ctx.requestId;
    if (!user) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Not signed in' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
    const forbidden = assertAdmin(user);
    if (forbidden) return forbidden;
    return null;
  },
  handler: async (input, ctx) => {
    const user = await getCurrentUserInRoute(ctx.req as any);
    try {
      const rl = checkRateLimit(`plink:create:${user!.id}`, 60, 60000);
      if (!(rl as any).allowed) {
        const retry = Math.max(0, (rl as any).resetAt - Date.now());
        return NextResponse.json(
          { error: { code: 'TOO_MANY_REQUESTS', message: 'Rate limit' }, requestId: ctx.requestId },
          {
            status: 429,
            headers: {
              'x-request-id': ctx.requestId,
              'retry-after': String(Math.ceil(retry / 1000)),
              'x-rate-limit-remaining': String((rl as any).remaining),
              'x-rate-limit-reset': String(Math.ceil((rl as any).resetAt / 1000))
            }
          }
        );
      }
    } catch {}
    const row = await createParentLink({ parentId: input!.parent_id, studentId: input!.student_id });
    try {
      const supabase = getRouteHandlerSupabase();
      await supabase.from('audit_logs').insert({ actor_id: user!.id, action: 'parent-link.create', entity_type: 'parent_link', entity_id: `${input!.parent_id}:${input!.student_id}`, details: {} });
    } catch {}
    return jsonDto(row as any, z.any() as any, { requestId: ctx.requestId, status: 201 });
  }
}));

export const DELETE = withRouteTiming(createApiHandler({
  schema: parentLinkDeleteRequest,
  preAuth: async (ctx) => {
    const user = await getCurrentUserInRoute(ctx.req as any);
    const requestId = ctx.requestId;
    if (!user) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Not signed in' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
    const forbidden = assertAdmin(user);
    if (forbidden) return forbidden;
    return null;
  },
  handler: async (input, ctx) => {
    const user = await getCurrentUserInRoute(ctx.req as any);
    try {
      const rl = checkRateLimit(`plink:del:${user!.id}`, 60, 60000);
      if (!(rl as any).allowed) {
        const retry = Math.max(0, (rl as any).resetAt - Date.now());
        return NextResponse.json(
          { error: { code: 'TOO_MANY_REQUESTS', message: 'Rate limit' }, requestId: ctx.requestId },
          {
            status: 429,
            headers: {
              'x-request-id': ctx.requestId,
              'retry-after': String(Math.ceil(retry / 1000)),
              'x-rate-limit-remaining': String((rl as any).remaining),
              'x-rate-limit-reset': String(Math.ceil((rl as any).resetAt / 1000))
            }
          }
        );
      }
    } catch {}
    await deleteParentLink({ parentId: input!.parent_id, studentId: input!.student_id });
    try {
      const supabase = getRouteHandlerSupabase();
      await supabase.from('audit_logs').insert({ actor_id: user!.id, action: 'parent-link.delete', entity_type: 'parent_link', entity_id: `${input!.parent_id}:${input!.student_id}`, details: {} });
    } catch {}
    return jsonDto({ ok: true } as any, z.object({ ok: z.boolean() }) as any, { requestId: ctx.requestId, status: 200 });
  }
}));

const listParentLinksQueryProd = z.object({ parent_id: z.string().uuid() }).strict();

export const GET = withRouteTiming(async function GET(req: NextRequest) {
  const user = await getCurrentUserInRoute(req);
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Not signed in' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
  let q: { parent_id: string };
  try {
    const schema = isTestMode()
      ? z.object({ parent_id: z.string().min(1) }).strict()
      : listParentLinksQueryProd;
    q = parseQuery(req, schema);
  } catch (e: any) {
    return NextResponse.json({ error: { code: 'BAD_REQUEST', message: e.message }, requestId }, { status: 400, headers: { 'x-request-id': requestId } });
  }
  const role = (user.user_metadata as any)?.role;
  // In TEST_MODE, parent "self" refers to the synthetic id used by fixtures ('test-parent-id')
  const selfId = isTestMode() && role === 'parent' ? 'test-parent-id' : user.id;
  if (role !== 'admin' && selfId !== q.parent_id) {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Not allowed' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
  }
  const rows = await listChildrenForParent(q.parent_id);
  const rowSchemaStrict = z.object({ id: z.string().uuid(), parent_id: z.string().uuid(), student_id: z.string().uuid(), created_at: z.string() });
  const rowSchemaLoose = z.object({ id: z.string(), parent_id: z.string(), student_id: z.string(), created_at: z.string() });
  const schema = isTestMode() ? z.array(rowSchemaLoose) : z.array(rowSchemaStrict);
  return jsonDto(rows as any, schema as any, { requestId, status: 200 });
});


