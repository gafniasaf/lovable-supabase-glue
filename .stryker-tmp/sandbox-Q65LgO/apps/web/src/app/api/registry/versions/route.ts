// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { withRouteTiming } from "@/server/withRouteTiming";
import { getCurrentUserInRoute, getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { courseVersion } from "@education/shared";
import { z } from "zod";
import { parseQuery } from "@/lib/zodQuery";
import { checkRateLimit } from "@/lib/rateLimit";
import { incrCounter } from "@/lib/metrics";

function isExternalCoursesEnabled() {
  return process.env.EXTERNAL_COURSES === "1";
}

export const GET = withRouteTiming(async function GET(req: NextRequest) {
  const requestId = req.headers.get("x-request-id") || crypto.randomUUID();
  if (!isExternalCoursesEnabled()) return NextResponse.json({ error: { code: "FORBIDDEN", message: "External courses disabled" }, requestId }, { status: 403, headers: { "x-request-id": requestId } });
  const user = await getCurrentUserInRoute(req);
  if (!user) return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Not signed in" }, requestId }, { status: 401, headers: { "x-request-id": requestId } });
  try {
    const rl = checkRateLimit(`registry:versions:list:${user.id}`, Number(process.env.REGISTRY_LIST_LIMIT || 120), Number(process.env.REGISTRY_LIST_WINDOW_MS || 60000));
    if (!rl.allowed) {
      try { incrCounter('rate_limit.hit'); } catch {}
      const retry = Math.max(0, rl.resetAt - Date.now());
      return NextResponse.json(
        { error: { code: 'TOO_MANY_REQUESTS', message: 'Rate limit' }, requestId },
        { status: 429, headers: { 'x-request-id': requestId, 'retry-after': String(Math.ceil(retry / 1000)), 'x-rate-limit-remaining': String(rl.remaining), 'x-rate-limit-reset': String(Math.ceil(rl.resetAt / 1000)) } }
      );
    }
  } catch {}
  const qSchema = z.object({ external_course_id: z.string().uuid().optional(), page: z.string().optional(), page_size: z.string().optional() }).strict();
  let raw: z.infer<typeof qSchema>;
  try { raw = parseQuery(req, qSchema); } catch (e: any) {
    return NextResponse.json({ error: { code: 'BAD_REQUEST', message: e.message }, requestId }, { status: 400, headers: { 'x-request-id': requestId } });
  }
  const courseId = raw.external_course_id;
  const supabase = getRouteHandlerSupabase();
  let query = supabase.from("course_versions").select("*", { count: "exact" } as any).order("created_at", { ascending: false }) as any;
  const page = Math.max(1, Number(raw.page || 1));
  const pageSize = Math.min(100, Math.max(1, Number(raw.page_size || 20)));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);
  if (courseId) query = query.eq("external_course_id", courseId);
  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: { code: "DB_ERROR", message: error.message }, requestId }, { status: 500, headers: { "x-request-id": requestId } });
  try {
    const parsed = (data ?? []).map((r: unknown) => courseVersion.parse(r));
    const headers: Record<string, string> = { "x-request-id": requestId };
    if (typeof count === "number") headers["x-total-count"] = String(count);
    return NextResponse.json(parsed, { status: 200, headers });
  } catch {
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'Invalid course version shape' }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
  }
});

export const POST = withRouteTiming(async function POST(req: NextRequest) {
  const requestId = req.headers.get("x-request-id") || crypto.randomUUID();
  if (!isExternalCoursesEnabled()) return NextResponse.json({ error: { code: "FORBIDDEN", message: "External courses disabled" }, requestId }, { status: 403, headers: { "x-request-id": requestId } });
  const user = await getCurrentUserInRoute(req);
  const role = (user?.user_metadata as any)?.role;
  if (!user) return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Not signed in" }, requestId }, { status: 401, headers: { "x-request-id": requestId } });
  if (role !== "admin") return NextResponse.json({ error: { code: "FORBIDDEN", message: "Admins only" }, requestId }, { status: 403, headers: { "x-request-id": requestId } });
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
  const parsed = courseVersion.pick({ external_course_id: true, version: true, status: true, manifest_hash: true, launch_url: true }).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: { code: "BAD_REQUEST", message: parsed.error.message }, requestId }, { status: 400, headers: { "x-request-id": requestId } });
  const supabase = getRouteHandlerSupabase();
  const { data, error } = await supabase.from("course_versions").insert(parsed.data as any).select().single();
  if (error) return NextResponse.json({ error: { code: "DB_ERROR", message: error.message }, requestId }, { status: 500, headers: { "x-request-id": requestId } });
  try { await supabase.from('audit_logs').insert({ actor_id: user.id, action: 'registry.version.create', entity_type: 'course_version', entity_id: (data as any).id, details: parsed.data }); } catch {}
  try { return NextResponse.json(courseVersion.parse(data as any), { status: 201, headers: { "x-request-id": requestId } }); } catch { return NextResponse.json({ error: { code: 'INTERNAL', message: 'Invalid course version shape' }, requestId }, { status: 500, headers: { 'x-request-id': requestId } }); }
});

export const PATCH = withRouteTiming(async function PATCH(req: NextRequest) {
  const requestId = req.headers.get("x-request-id") || crypto.randomUUID();
  if (!isExternalCoursesEnabled()) return NextResponse.json({ error: { code: "FORBIDDEN", message: "External courses disabled" }, requestId }, { status: 403, headers: { "x-request-id": requestId } });
  const user = await getCurrentUserInRoute(req);
  const role = (user?.user_metadata as any)?.role;
  if (!user) return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Not signed in" }, requestId }, { status: 401, headers: { "x-request-id": requestId } });
  if (role !== "admin") return NextResponse.json({ error: { code: "FORBIDDEN", message: "Admins only" }, requestId }, { status: 403, headers: { "x-request-id": requestId } });
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
  const body = await req.json().catch(() => ({}));
  const parsed = courseVersion.partial().strip().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: { code: "BAD_REQUEST", message: parsed.error.message }, requestId }, { status: 400, headers: { "x-request-id": requestId } });
  const supabase = getRouteHandlerSupabase();
  const { data, error } = await supabase.from("course_versions").update(parsed.data as any).eq("id", q.id).select().single();
  if (error) return NextResponse.json({ error: { code: "DB_ERROR", message: error.message }, requestId }, { status: 500, headers: { "x-request-id": requestId } });
  try { await supabase.from('audit_logs').insert({ actor_id: user.id, action: 'registry.version.update', entity_type: 'course_version', entity_id: q.id, details: parsed.data }); } catch {}
  try { return NextResponse.json(courseVersion.parse(data as any), { status: 200, headers: { "x-request-id": requestId } }); } catch { return NextResponse.json({ error: { code: 'INTERNAL', message: 'Invalid course version shape' }, requestId }, { status: 500, headers: { 'x-request-id': requestId } }); }
});

export const DELETE = withRouteTiming(async function DELETE(req: NextRequest) {
  const requestId = req.headers.get("x-request-id") || crypto.randomUUID();
  if (!isExternalCoursesEnabled()) return NextResponse.json({ error: { code: "FORBIDDEN", message: "External courses disabled" }, requestId }, { status: 403, headers: { "x-request-id": requestId } });
  const user = await getCurrentUserInRoute(req);
  const role = (user?.user_metadata as any)?.role;
  if (!user) return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Not signed in" }, requestId }, { status: 401, headers: { "x-request-id": requestId } });
  if (role !== "admin") return NextResponse.json({ error: { code: "FORBIDDEN", message: "Admins only" }, requestId }, { status: 403, headers: { "x-request-id": requestId } });
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: { code: "BAD_REQUEST", message: "id required" }, requestId }, { status: 400, headers: { "x-request-id": requestId } });
  const supabase = getRouteHandlerSupabase();
  const { data, error } = await supabase.from("course_versions").delete().eq("id", id).select().single();
  if (error) return NextResponse.json({ error: { code: "DB_ERROR", message: error.message }, requestId }, { status: 500, headers: { "x-request-id": requestId } });
  try { await supabase.from('audit_logs').insert({ actor_id: user.id, action: 'registry.version.delete', entity_type: 'course_version', entity_id: id, details: {} }); } catch {}
  return NextResponse.json(data ?? { ok: true }, { status: 200, headers: { "x-request-id": requestId } });
});


