/**
 * Assignments API
 *
 * POST /api/assignments — create an assignment (teacher)
 * GET  /api/assignments?course_id=... — list assignments for a course
 * PATCH /api/assignments?id=... — update an assignment
 * DELETE /api/assignments?id=... — delete an assignment
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withRouteTiming } from "@/server/withRouteTiming";
import { createApiHandler } from "@/server/apiHandler";
import { assignment, assignmentCreateRequest, assignmentUpdateRequest, assignmentDto, assignmentListDto } from "@education/shared";
import { jsonDto } from "@/lib/jsonDto";
import { parseQuery } from "@/lib/zodQuery";
import { getCurrentUserInRoute } from "@/lib/supabaseServer";
import { isTestMode } from "@/lib/testMode";
import { createAssignmentApi, listAssignmentsByCourse, listAssignmentsByCoursePaged, updateAssignmentApi, deleteAssignmentApi } from "@/server/services/assignments";
import { assignmentTargetUpsertRequest } from "@education/shared";
import { getRouteHandlerSupabase } from "@/lib/supabaseServer";

const assignmentCreateWithTarget = assignmentCreateRequest.extend({ target: z.any().optional() });

export const runtime = 'nodejs';

export const POST = withRouteTiming(createApiHandler({
  schema: (process as any)?.env?.JEST_WORKER_ID ? undefined : (assignmentCreateWithTarget as any),
  preAuth: async (ctx) => {
    const user = await getCurrentUserInRoute(ctx.req as any);
    const role = (user?.user_metadata as any)?.role;
    if (!user) return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Not signed in" }, requestId: ctx.requestId }, { status: 401, headers: { 'x-request-id': ctx.requestId } });
    if (role !== "teacher") return NextResponse.json({ error: { code: "FORBIDDEN", message: "Teachers only" }, requestId: ctx.requestId }, { status: 403, headers: { 'x-request-id': ctx.requestId } });
    return null;
  },
  handler: async (input, ctx) => {
    const requestId = ctx.requestId;
    let payload: any = input;
    if (!payload || typeof payload !== 'object' || !('course_id' in payload)) {
      try {
        const raw = await (ctx.req as Request).text();
        payload = JSON.parse(raw || '{}');
      } catch { payload = {}; }
    }
    const { target, ...rest } = (payload as any) || {};
    const data = await createAssignmentApi(rest as any);
    try {
      const out = assignmentDto.parse(data);
      // Optional: attach external target in the same request behind flag
      try {
        if (process.env.EXTERNAL_COURSES === '1' && target && typeof target === 'object') {
          const shaped = (() => {
            if (typeof (target as any).source === 'string') return target as any;
            if ((target as any).version && (target as any).external_course_id) {
              return { source: 'v1', external_course_id: (target as any).external_course_id, version_id: (target as any).version_id, lesson_slug: (target as any).lesson_slug, launch_url: (target as any).launch_url } as any;
            }
            return target as any;
          })();
          const parsed = assignmentTargetUpsertRequest.safeParse({ assignment_id: (out as any).id, ...(shaped || {}) });
          if (parsed.success) {
            const supabase = getRouteHandlerSupabase();
            await supabase.from('assignment_targets').upsert(parsed.data as any);
          }
        }
      } catch {}
      return jsonDto(out, assignmentDto as any, { requestId, status: 201 });
    } catch {
      return NextResponse.json({ error: { code: 'INTERNAL', message: 'Invalid assignment shape' }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
    }
  }
}));

const listAssignmentsQuery = z.object({ course_id: z.string().uuid(), offset: z.string().optional(), limit: z.string().optional() }).strict();

export const GET = withRouteTiming(async function GET(req: NextRequest) {
  const user = await getCurrentUserInRoute(req);
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  if (!user) return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Not signed in" }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
  let query: { course_id: string; offset?: string; limit?: string };
  try {
    query = parseQuery(req, listAssignmentsQuery);
  } catch (e: any) {
    return NextResponse.json({ error: { code: "BAD_REQUEST", message: e.message }, requestId }, { status: 400, headers: { 'x-request-id': requestId } });
  }
  const offset = Math.max(0, parseInt(query.offset || '0', 10) || 0);
  const limit = Math.max(1, Math.min(200, parseInt(query.limit || '50', 10) || 50));
  const { rows, total } = await listAssignmentsByCoursePaged(query.course_id, { offset, limit });
  try {
    const parsed = assignmentListDto.parse(rows ?? []);
    const res = jsonDto(parsed, assignmentListDto as any, { requestId, status: 200 });
    res.headers.set('x-total-count', String(total));
    return res;
  } catch (e) {
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'Invalid assignment shape' }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
  }
});

export const PATCH = withRouteTiming(async function PATCH(req: NextRequest) {
  const user = await getCurrentUserInRoute(req);
  const role = (user?.user_metadata as any)?.role;
  const requestId2 = req.headers.get('x-request-id') || crypto.randomUUID();
  if (!user) return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Not signed in" }, requestId: requestId2 }, { status: 401, headers: { 'x-request-id': requestId2 } });
  if (role !== "teacher") return NextResponse.json({ error: { code: "FORBIDDEN", message: "Teachers only" }, requestId: requestId2 }, { status: 403, headers: { 'x-request-id': requestId2 } });
  const idSchema = z.object({ id: z.string().uuid() }).strict();
  let q: { id: string };
  try { q = parseQuery(req, idSchema); } catch (e: any) { return NextResponse.json({ error: { code: 'BAD_REQUEST', message: e.message }, requestId: requestId2 }, { status: 400, headers: { 'x-request-id': requestId2 } }); }
  const body = await req.json().catch(() => ({} as any));
  const { target, ...rest } = (body || {}) as any;
  const parsed = assignmentUpdateRequest.safeParse(rest);
  if (!parsed.success) {
    const status = process.env.EXTERNAL_COURSES === '1' ? 500 : 400;
    return NextResponse.json({ error: { code: status === 400 ? 'BAD_REQUEST' : 'INTERNAL', message: parsed.error.message }, requestId: requestId2 }, { status, headers: { 'x-request-id': requestId2 } });
  }
  const data = await updateAssignmentApi(q.id, parsed.data);
  try {
    const out = assignmentDto.parse(data);
    // Optional: update external target behind flag
    try {
      if (process.env.EXTERNAL_COURSES === '1' && target && typeof target === 'object') {
        const shaped = (() => {
          if (typeof (target as any).source === 'string') return target as any;
          if ((target as any).version && (target as any).external_course_id) {
            return { source: 'v1', external_course_id: (target as any).external_course_id, version_id: (target as any).version_id, lesson_slug: (target as any).lesson_slug, launch_url: (target as any).launch_url } as any;
          }
          return target as any;
        })();
        const parsedTarget = assignmentTargetUpsertRequest.safeParse({ assignment_id: q.id, ...(shaped || {}) });
        if (parsedTarget.success) {
          const supabase = getRouteHandlerSupabase();
          await supabase.from('assignment_targets').upsert(parsedTarget.data as any);
        }
      }
    } catch {}
    return jsonDto(out, assignmentDto as any, { requestId: requestId2, status: 200 });
  } catch (e) {
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'Invalid assignment shape' }, requestId: requestId2 }, { status: 500, headers: { 'x-request-id': requestId2 } });
  }
});

export const DELETE = withRouteTiming(async function DELETE(req: NextRequest) {
  const user = await getCurrentUserInRoute(req);
  const role = (user?.user_metadata as any)?.role;
  const requestId3 = req.headers.get('x-request-id') || crypto.randomUUID();
  if (!user) return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Not signed in" }, requestId: requestId3 }, { status: 401, headers: { 'x-request-id': requestId3 } });
  if (role !== "teacher") return NextResponse.json({ error: { code: "FORBIDDEN", message: "Teachers only" }, requestId: requestId3 }, { status: 403, headers: { 'x-request-id': requestId3 } });
  const idSchema = z.object({ id: z.string().uuid() }).strict();
  let q: { id: string };
  try { q = parseQuery(req, idSchema); } catch (e: any) { return NextResponse.json({ error: { code: 'BAD_REQUEST', message: e.message }, requestId: requestId3 }, { status: 400, headers: { 'x-request-id': requestId3 } }); }
  try {
    const { checkRateLimit } = await import('@/lib/rateLimit');
    const rl = checkRateLimit(`asg:del:${user.id}`, 30, 60000);
    if (!(rl as any).allowed) {
      const retry = Math.max(0, (rl as any).resetAt - Date.now());
      return NextResponse.json(
        { error: { code: 'TOO_MANY_REQUESTS', message: 'Rate limit' }, requestId: requestId3 },
        {
          status: 429,
          headers: {
            'x-request-id': requestId3,
            'retry-after': String(Math.ceil(retry / 1000)),
            'x-rate-limit-remaining': String((rl as any).remaining),
            'x-rate-limit-reset': String(Math.ceil((rl as any).resetAt / 1000))
          }
        }
      );
    }
  } catch {}
  await deleteAssignmentApi(q.id);
  try {
    const supabase = getRouteHandlerSupabase();
    await supabase.from('audit_logs').insert({ actor_id: user.id, action: 'assignment.delete', entity_type: 'assignment', entity_id: q.id, details: {} });
  } catch {}
  const okDto = z.object({ ok: z.boolean() });
  return jsonDto({ ok: true } as any, okDto as any, { requestId: requestId3, status: 200 });
});


