/**
 * Events API (test-mode only)
 *
 * POST /api/events — record an event
 * GET  /api/events — list recent events (in-memory)
 */
// @ts-nocheck

import { NextRequest, NextResponse } from "next/server";
import { withRouteTiming } from "@/server/withRouteTiming";
import { createApiHandler } from "@/server/apiHandler";
import { eventCreateRequest } from "@education/shared";
import { getCurrentUserInRoute } from "@/lib/supabaseServer";
import { isTestMode } from "@/lib/testMode";

const events: any[] = [];

export const POST = withRouteTiming(createApiHandler({
  schema: eventCreateRequest,
  handler: async (input, ctx) => {
    const requestId = ctx.requestId;
    const user = await getCurrentUserInRoute();
    if (!user) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Not signed in' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
    if (!isTestMode()) {
      // In prod, just accept and return 204 for now (stub).
      return new NextResponse(null, { status: 204, headers: { 'x-request-id': requestId } });
    }
    const row = { id: crypto.randomUUID(), user_id: user.id, event_type: input!.event_type, entity_type: input!.entity_type, entity_id: input!.entity_id, ts: new Date().toISOString(), meta: input!.meta };
    events.push(row);
    return NextResponse.json(row, { status: 201 });
  }
}));

export const dynamic = 'force-dynamic';

export const GET = withRouteTiming(async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  const user = await getCurrentUserInRoute(req);
  if (!user) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Not signed in' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
  if (!isTestMode()) {
    // In prod, events listing is not available; return empty.
    return NextResponse.json([], { status: 200, headers: { 'x-request-id': requestId } });
  }
  const rows = events.slice(-200).reverse();
  return NextResponse.json(rows, { status: 200, headers: { 'x-request-id': requestId } });
});
