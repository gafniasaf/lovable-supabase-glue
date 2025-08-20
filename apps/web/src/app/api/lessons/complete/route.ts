import { NextResponse } from "next/server";
import { withRouteTiming } from "@/server/withRouteTiming";
import { createApiHandler } from "@/server/apiHandler";
import { getCurrentUserInRoute } from "@/lib/supabaseServer";
import { markLessonComplete } from "@/server/services/progress";
import { markLessonCompleteRequest, progressResponse } from "@education/shared";
import { jsonDto } from "@/lib/jsonDto";

export const POST = withRouteTiming(createApiHandler({
  handler: async (_input, ctx) => {
    const requestId = ctx.requestId;
    const user = await getCurrentUserInRoute(ctx.req as any);
    if (!user) return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Not signed in" }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
    const role = (user.user_metadata as any)?.role;
    if (role !== "student") return NextResponse.json({ error: { code: "FORBIDDEN", message: "Students only" }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
    const json = await (ctx.req as Request).json().catch(() => ({}));
    const parsed = markLessonCompleteRequest.safeParse(json);
    if (!parsed.success) return NextResponse.json({ error: { code: "BAD_REQUEST", message: parsed.error.message }, requestId }, { status: 400, headers: { 'x-request-id': requestId } });
    const latest = await markLessonComplete(user.id, parsed.data.lessonId);
    return jsonDto({ latest }, progressResponse as any, { requestId, status: 200 });
  }
}));


