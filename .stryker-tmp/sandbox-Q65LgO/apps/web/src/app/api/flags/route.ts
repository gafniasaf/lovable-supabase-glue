// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { withRouteTiming } from "@/server/withRouteTiming";
import { getCurrentUserInRoute } from "@/lib/supabaseServer";
import { isTestMode } from "@/lib/testMode";
import { listTestFeatureFlags, setTestFeatureFlag } from "@/lib/testStore";

export const GET = withRouteTiming(async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const user = await getCurrentUserInRoute(req);
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Not signed in' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
  if (!isTestMode()) return NextResponse.json({ error: { code: 'NOT_IMPLEMENTED', message: 'Prod not implemented' }, requestId }, { status: 501, headers: { 'x-request-id': requestId } });
  const flags = listTestFeatureFlags();
  return NextResponse.json(flags, { status: 200, headers: { 'x-request-id': requestId } });
});

export const PATCH = withRouteTiming(async function PATCH(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const user = await getCurrentUserInRoute(req);
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Not signed in' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
  if (!isTestMode()) return NextResponse.json({ error: { code: 'NOT_IMPLEMENTED', message: 'Prod not implemented' }, requestId }, { status: 501, headers: { 'x-request-id': requestId } });
  const body = await req.json().catch(() => ({}));
  const key = String((body as any).key || '').trim();
  const value = Boolean((body as any).value);
  if (!key) return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'key is required' }, requestId }, { status: 400, headers: { 'x-request-id': requestId } });
  const out = setTestFeatureFlag(key, value);
  return NextResponse.json(out, { status: 200, headers: { 'x-request-id': requestId } });
});

export const dynamic = 'force-dynamic';


