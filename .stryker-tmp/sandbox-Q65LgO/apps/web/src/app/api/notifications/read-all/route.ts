// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { withRouteTiming } from "@/server/withRouteTiming";
import { getCurrentUserInRoute, getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { markAllTestNotificationsRead } from "@/lib/testStore";
import { isTestMode } from "@/lib/testMode";

export const PATCH = withRouteTiming(async function PATCH(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const user = await getCurrentUserInRoute(req);
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Not signed in' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
  if (isTestMode()) {
    const out = markAllTestNotificationsRead(user.id);
    return NextResponse.json(out, { status: 200, headers: { 'x-request-id': requestId } });
  }
  const supabase = getRouteHandlerSupabase();
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('read_at', null);
  if (error) return NextResponse.json({ error: { code: 'DB_ERROR', message: error.message }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
  return NextResponse.json({ ok: true }, { status: 200, headers: { 'x-request-id': requestId } });
});

export const POST = withRouteTiming(async function POST(req: NextRequest) {
  // Accept POST for HTML form submissions; delegate to PATCH logic
  return PATCH(req);
});


