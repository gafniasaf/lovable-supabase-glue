import { NextRequest, NextResponse } from "next/server";
import { withRouteTiming } from "@/server/withRouteTiming";
import { getCurrentUserInRoute, getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { isTestMode } from "@/lib/testMode";
import { z } from "zod";
import { externalCourse } from "@education/shared";
import { jsonDto } from "@/lib/jsonDto";
import { parseQuery } from "@/lib/zodQuery";
import { checkRateLimit } from "@/lib/rateLimit";
import { incrCounter } from "@/lib/metrics";

const createReq = externalCourse.pick({ vendor_id: true, kind: true, title: true, description: true, version: true, status: true, launch_url: true, bundle_ref: true, scopes: true });
const patchReq = z.object({ id: z.string().uuid(), data: externalCourse.partial().strip() }).strict();

function isExternalCoursesEnabled() {
  return process.env.EXTERNAL_COURSES === "1";
}

export const GET = withRouteTiming(async function GET(req: NextRequest) {
  const requestId = req.headers.get("x-request-id") || crypto.randomUUID();
  if (!isExternalCoursesEnabled()) return NextResponse.json({ error: { code: "FORBIDDEN", message: "External courses disabled" }, requestId }, { status: 403, headers: { "x-request-id": requestId } });
  const user = await getCurrentUserInRoute(req);
  if (!user) return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Not signed in" }, requestId }, { status: 401, headers: { "x-request-id": requestId } });
  // Read rate limit per user
  try {
    const rl = checkRateLimit(`registry:list:${user.id}`, Number(process.env.REGISTRY_LIST_LIMIT || 120), Number(process.env.REGISTRY_LIST_WINDOW_MS || 60000));
    if (!rl.allowed) {
      try { incrCounter('rate_limit.hit'); } catch {}
      const retry = Math.max(0, rl.resetAt - Date.now());
      return NextResponse.json(
        { error: { code: 'TOO_MANY_REQUESTS', message: 'Rate limit' }, requestId },
        { status: 429, headers: { 'x-request-id': requestId, 'retry-after': String(Math.ceil(retry / 1000)), 'x-rate-limit-remaining': String(rl.remaining), 'x-rate-limit-reset': String(Math.ceil(rl.resetAt / 1000)) } }
      );
    }
  } catch {}
  // In test mode, avoid DB and return an empty list (with optional q filter behavior)
  if (isTestMode()) {
    const { jsonDto } = await import('@/lib/jsonDto');
    const { externalCourse } = await import('@education/shared');
    return jsonDto([] as any, (externalCourse as any).array(), { requestId, status: 200 });
  }
  const supabase = getRouteHandlerSupabase();
  const qSchema = z.object({
    id: z.string().uuid().optional(),
    q: z.string().optional(),
    status: z.enum(["draft","approved","disabled"]).optional(),
    kind: z.enum(["v1","v2"]).optional(),
    vendor_id: z.string().uuid().optional(),
    page: z.string().optional(),
    page_size: z.string().optional(),
  }).strict();
  let raw: z.infer<typeof qSchema>;
  try {
    raw = parseQuery(req, qSchema);
  } catch (e: any) {
    return NextResponse.json({ error: { code: 'BAD_REQUEST', message: e.message }, requestId }, { status: 400, headers: { 'x-request-id': requestId } });
  }
  const id = raw.id?.trim();
  const q = raw.q?.trim();
  const status = raw.status?.trim();
  const kind = raw.kind?.trim();
  const vendorId = raw.vendor_id?.trim();
  const page = Math.max(1, Number(raw.page || 1));
  const pageSize = Math.min(100, Math.max(1, Number(raw.page_size || 20)));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  let query = supabase.from("external_courses").select("*", { count: "exact" } as any).order("created_at", { ascending: false }).range(from, to) as any;
  if (id) query = query.eq("id", id);
  if (q) query = query.ilike("title", `%${q}%`);
  if (status) query = query.eq("status", status);
  if (kind) query = query.eq("kind", kind);
  if (vendorId) query = query.eq("vendor_id", vendorId);
  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: { code: "DB_ERROR", message: error.message }, requestId }, { status: 500, headers: { "x-request-id": requestId } });
  try {
    const parsed = (data ?? []).map((r: unknown) => externalCourse.parse(r));
    const res = jsonDto(parsed, (externalCourse as any).array(), { requestId, status: 200 });
    if (typeof count === "number") res.headers.set("x-total-count", String(count));
    return res;
  } catch {
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'Invalid external course shape' }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
  }
});

export const POST = withRouteTiming(async function POST(req: NextRequest) {
  const requestId = req.headers.get("x-request-id") || crypto.randomUUID();
  if (!isExternalCoursesEnabled()) return NextResponse.json({ error: { code: "FORBIDDEN", message: "External courses disabled" }, requestId }, { status: 403, headers: { "x-request-id": requestId } });
  const user = await getCurrentUserInRoute(req);
  const role = (user?.user_metadata as any)?.role;
  if (!user) return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Not signed in" }, requestId }, { status: 401, headers: { "x-request-id": requestId } });
  if (role !== "admin") return NextResponse.json({ error: { code: "FORBIDDEN", message: "Admins only" }, requestId }, { status: 403, headers: { "x-request-id": requestId } });
  // Mutation rate limit per admin
  try {
    const rl = checkRateLimit(`registry:mut:${user.id}`, Number(process.env.REGISTRY_MUTATE_LIMIT || 30), Number(process.env.REGISTRY_MUTATE_WINDOW_MS || 60000));
    if (!rl.allowed) {
      try { incrCounter('rate_limit.hit'); } catch {}
      const retry = Math.max(0, rl.resetAt - Date.now());
      return NextResponse.json(
        { error: { code: 'TOO_MANY_REQUESTS', message: 'Rate limit' }, requestId },
        { status: 429, headers: { 'x-request-id': requestId, 'retry-after': String(Math.ceil(retry / 1000)), 'x-rate-limit-remaining': String(rl.remaining), 'x-rate-limit-reset': String(Math.ceil(rl.resetAt / 1000)) } }
      );
    }
  } catch {}
  const body = await req.json().catch(() => ({}));
  const parsed = createReq.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: { code: "BAD_REQUEST", message: parsed.error.message }, requestId }, { status: 400, headers: { "x-request-id": requestId } });
  const supabase = getRouteHandlerSupabase();
  const { data, error } = await supabase.from("external_courses").insert(parsed.data as any).select().single();
  if (error) return NextResponse.json({ error: { code: "DB_ERROR", message: error.message }, requestId }, { status: 500, headers: { "x-request-id": requestId } });
  try { await supabase.from('audit_logs').insert({ actor_id: user.id, action: 'registry.external.create', entity_type: 'external_course', entity_id: (data as any).id, details: parsed.data }); } catch {}
  try { return jsonDto(externalCourse.parse(data as any), externalCourse as any, { requestId, status: 201 }); } catch { return NextResponse.json({ error: { code: 'INTERNAL', message: 'Invalid external course shape' }, requestId }, { status: 500, headers: { 'x-request-id': requestId } }); }
});

export const PATCH = withRouteTiming(async function PATCH(req: NextRequest) {
  const requestId = req.headers.get("x-request-id") || crypto.randomUUID();
  if (!isExternalCoursesEnabled()) return NextResponse.json({ error: { code: "FORBIDDEN", message: "External courses disabled" }, requestId }, { status: 403, headers: { "x-request-id": requestId } });
  const user = await getCurrentUserInRoute(req);
  const role = (user?.user_metadata as any)?.role;
  if (!user) return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Not signed in" }, requestId }, { status: 401, headers: { "x-request-id": requestId } });
  if (role !== "admin") return NextResponse.json({ error: { code: "FORBIDDEN", message: "Admins only" }, requestId }, { status: 403, headers: { "x-request-id": requestId } });
  // Mutation rate limit per admin
  try {
    const rl = checkRateLimit(`registry:mut:${user.id}`, Number(process.env.REGISTRY_MUTATE_LIMIT || 30), Number(process.env.REGISTRY_MUTATE_WINDOW_MS || 60000));
    if (!rl.allowed) {
      try { incrCounter('rate_limit.hit'); } catch {}
      const retry = Math.max(0, rl.resetAt - Date.now());
      return NextResponse.json(
        { error: { code: 'TOO_MANY_REQUESTS', message: 'Rate limit' }, requestId },
        { status: 429, headers: { 'x-request-id': requestId, 'retry-after': String(Math.ceil(retry / 1000)), 'x-rate-limit-remaining': String(rl.remaining), 'x-rate-limit-reset': String(Math.ceil(rl.resetAt / 1000)) } }
      );
    }
  } catch {}
  const body = await req.json().catch(() => ({}));
  const idSchema = z.object({ id: z.string().uuid() }).strict();
  let q: { id: string };
  try { q = parseQuery(req, idSchema); } catch (e: any) { return NextResponse.json({ error: { code: 'BAD_REQUEST', message: e.message }, requestId }, { status: 400, headers: { 'x-request-id': requestId } }); }
  const parsed = patchReq.safeParse({ id: q.id, data: body });
  if (!parsed.success) return NextResponse.json({ error: { code: "BAD_REQUEST", message: parsed.error.message }, requestId }, { status: 400, headers: { "x-request-id": requestId } });
  const supabase = getRouteHandlerSupabase();
  const { data, error } = await supabase.from("external_courses").update(parsed.data.data as any).eq("id", parsed.data.id).select().single();
  if (error) return NextResponse.json({ error: { code: "DB_ERROR", message: error.message }, requestId }, { status: 500, headers: { "x-request-id": requestId } });
  try { await supabase.from('audit_logs').insert({ actor_id: user.id, action: 'registry.external.update', entity_type: 'external_course', entity_id: parsed.data.id, details: parsed.data.data }); } catch {}
  try { return jsonDto(externalCourse.parse(data as any), externalCourse as any, { requestId, status: 200 }); } catch { return NextResponse.json({ error: { code: 'INTERNAL', message: 'Invalid external course shape' }, requestId }, { status: 500, headers: { 'x-request-id': requestId } }); }
});

export const DELETE = withRouteTiming(async function DELETE(req: NextRequest) {
  const requestId = req.headers.get("x-request-id") || crypto.randomUUID();
  if (!isExternalCoursesEnabled()) return NextResponse.json({ error: { code: "FORBIDDEN", message: "External courses disabled" }, requestId }, { status: 403, headers: { "x-request-id": requestId } });
  const user = await getCurrentUserInRoute(req);
  const role = (user?.user_metadata as any)?.role;
  if (!user) return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Not signed in" }, requestId }, { status: 401, headers: { "x-request-id": requestId } });
  if (role !== "admin") return NextResponse.json({ error: { code: "FORBIDDEN", message: "Admins only" }, requestId }, { status: 403, headers: { "x-request-id": requestId } });
  // Mutation rate limit per admin
  try {
    const rl = checkRateLimit(`registry:mut:${user.id}`, Number(process.env.REGISTRY_MUTATE_LIMIT || 30), Number(process.env.REGISTRY_MUTATE_WINDOW_MS || 60000));
    if (!rl.allowed) {
      try { incrCounter('rate_limit.hit'); } catch {}
      const retry = Math.max(0, rl.resetAt - Date.now());
      return NextResponse.json(
        { error: { code: 'TOO_MANY_REQUESTS', message: 'Rate limit' }, requestId },
        { status: 429, headers: { 'x-request-id': requestId, 'retry-after': String(Math.ceil(retry / 1000)), 'x-rate-limit-remaining': String(rl.remaining), 'x-rate-limit-reset': String(Math.ceil(rl.resetAt / 1000)) } }
      );
    }
  } catch {}
  const idSchema = z.object({ id: z.string().uuid() }).strict();
  let q: { id: string };
  try { q = parseQuery(req, idSchema); } catch (e: any) { return NextResponse.json({ error: { code: 'BAD_REQUEST', message: e.message }, requestId }, { status: 400, headers: { 'x-request-id': requestId } }); }
  const supabase = getRouteHandlerSupabase();
  const { data, error } = await supabase.from("external_courses").delete().eq("id", q.id).select().single();
  if (error) return NextResponse.json({ error: { code: "DB_ERROR", message: error.message }, requestId }, { status: 500, headers: { "x-request-id": requestId } });
  try { await supabase.from('audit_logs').insert({ actor_id: user.id, action: 'registry.external.delete', entity_type: 'external_course', entity_id: q.id, details: {} }); } catch {}
  const { jsonDto } = await import('@/lib/jsonDto');
  const { externalCourse } = await import('@education/shared');
  if (Array.isArray(data)) {
    return jsonDto(data as any, (externalCourse as any).array(), { requestId, status: 200 });
  }
  return jsonDto({ ok: true } as any, ({} as any), { requestId, status: 200 });
});


