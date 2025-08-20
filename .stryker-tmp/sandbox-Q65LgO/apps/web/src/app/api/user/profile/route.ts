// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { profileResponse, profileUpdateRequest } from "@education/shared";
import { getCurrentUserInRoute, getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { withRouteTiming } from "@/server/withRouteTiming";
import { isTestMode } from "@/lib/testMode";
import { getTestProfile } from "@/lib/testStore";

export const GET = withRouteTiming(async function GET(req: NextRequest) {
  const user = await getCurrentUserInRoute(req);
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  if (!user) {
    return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Not signed in" }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
  }
  if (isTestMode()) {
    const p = getTestProfile(user.id) ?? { id: user.id, email: user.email ?? "", role: (user.user_metadata as any)?.role ?? "student" };
    const parsed = profileResponse.parse({
      id: p.id,
      email: p.email,
      role: (p as any).role,
      display_name: null,
      avatar_url: null,
      bio: null,
      preferences: {}
    });
    return NextResponse.json(parsed, { status: 200, headers: { 'x-request-id': requestId } });
  } else {
    const supabase = getRouteHandlerSupabase();
    const { data, error } = await supabase
      .from('profiles')
      .select('id,email,role,display_name,avatar_url,bio,preferences')
      .eq('id', user.id)
      .single();
    if (error) return NextResponse.json({ error: { code: 'DB_ERROR', message: error.message }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
    const role = (user.user_metadata as any)?.role ?? data?.role ?? "student";
    const parsed = profileResponse.parse({
      id: user.id,
      email: user.email ?? data?.email ?? "",
      role,
      display_name: (data as any)?.display_name ?? null,
      avatar_url: (data as any)?.avatar_url ?? null,
      bio: (data as any)?.bio ?? null,
      preferences: (data as any)?.preferences ?? {}
    });
    return NextResponse.json(parsed, { status: 200, headers: { 'x-request-id': requestId } });
  }
});

export const PUT = withRouteTiming(async function PUT(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const user = await getCurrentUserInRoute(req);
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Not signed in' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
  const body = await req.json().catch(() => ({}));
  const parsed = profileUpdateRequest.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: { code: 'BAD_REQUEST', message: parsed.error.message }, requestId }, { status: 400, headers: { 'x-request-id': requestId } });
  const supabase = getRouteHandlerSupabase();
  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: parsed.data.display_name ?? null,
      avatar_url: parsed.data.avatar_url ?? null,
      bio: parsed.data.bio ?? null,
      preferences: parsed.data.preferences ?? undefined
    })
    .eq('id', user.id);
  if (error) return NextResponse.json({ error: { code: 'DB_ERROR', message: error.message }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
  return NextResponse.json({ ok: true }, { status: 200, headers: { 'x-request-id': requestId } });
});


