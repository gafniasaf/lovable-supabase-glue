import { NextResponse, NextRequest } from "next/server";
import { withRouteTiming } from "@/server/withRouteTiming";
import { createApiHandler } from "@/server/apiHandler";
import { getCurrentUserInRoute } from "@/lib/supabaseServer";
import { getDashboardForUser } from "@/server/services/dashboard";
import { dashboardDto } from "@education/shared";
import { jsonDto } from "@/lib/jsonDto";

export const GET = withRouteTiming(createApiHandler({
  handler: async (_input, ctx) => {
    const requestId = ctx.requestId;
    const user = await getCurrentUserInRoute(ctx.req as any);
    if (!user) return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Not signed in" }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
    const role = (user.user_metadata as any)?.role ?? null;
    if (!role) return NextResponse.json({ error: { code: "FORBIDDEN", message: "Role required" }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
    const out = await getDashboardForUser(user.id, role);
    try {
      const dto = dashboardDto.parse(out);
      return jsonDto(dto, dashboardDto as any, { requestId, status: 200 });
    } catch {
      return NextResponse.json({ error: { code: 'INTERNAL', message: 'Invalid dashboard shape' }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
    }
  }
}));


