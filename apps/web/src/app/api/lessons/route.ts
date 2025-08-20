/**
 * Lessons API
 *
 * POST /api/lessons — create a lesson (teacher only)
 * GET  /api/lessons?course_id=... — list lessons for a course
 */
import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { getRouteHandlerSupabase, getCurrentUserInRoute } from "@/lib/supabaseServer";
import { lesson, lessonCreateRequest } from "@education/shared";
import { jsonDto } from "@/lib/jsonDto";
import { isTestMode } from "@/lib/testMode";
import { addTestLesson, listTestLessonsByCourse } from "@/lib/testStore";
import { createApiHandler } from "@/server/apiHandler";
import { withRouteTiming } from "@/server/withRouteTiming";
import { createLessonApi } from "@/server/services/lessons";
import { parseQuery } from "@/lib/zodQuery";

export const POST = withRouteTiming(createApiHandler({
	schema: lessonCreateRequest,
	handler: async (input, ctx) => {
		const requestId = ctx.requestId;
		const supabase = getRouteHandlerSupabase();
		const user = await getCurrentUserInRoute(ctx.req as any);
		const role = (user?.user_metadata as any)?.role ?? undefined;
		if (!user) return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Not signed in" }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
		if (role !== "teacher") return NextResponse.json({ error: { code: "FORBIDDEN", message: "Teachers only" }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
		const { course_id, title, content, order_index } = input!;
		const data = await createLessonApi({ course_id, title, content, order_index });
		try {
			const out = lesson.parse(data);
			return jsonDto(out, lesson as any, { requestId, status: 201 });
		} catch {
			return NextResponse.json({ error: { code: 'INTERNAL', message: 'Invalid lesson shape' }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
		}
	}
}));

const listLessonsQuery = z.object({ course_id: z.string().uuid(), offset: z.string().optional(), limit: z.string().optional() }).strict();

export async function GET(req: NextRequest) {
	const supabase = getRouteHandlerSupabase();
	const user = await getCurrentUserInRoute(req);
	const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
	if (!user) {
		return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Not signed in" }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
	}
	let query: { course_id: string; offset?: string; limit?: string };
	try {
		query = parseQuery(req, listLessonsQuery);
	} catch (e: any) {
		return NextResponse.json({ error: { code: "BAD_REQUEST", message: e.message }, requestId }, { status: 400, headers: { 'x-request-id': requestId } });
	}
	const offset = Math.max(0, parseInt(query.offset || '0', 10) || 0);
	const limit = Math.max(1, Math.min(200, parseInt(query.limit || '100', 10) || 100));
	if (isTestMode()) {
		const all = listTestLessonsByCourse(query.course_id);
		const rows = all.slice(offset, offset + limit);
		try {
			const mapped = (rows ?? []).map((r: any) => ({
				id: r.id,
				course_id: r.course_id,
				title: r.title,
				content: r.content,
				order_index: r.order_index,
				file_key: null,
				created_at: r.created_at
			}));
			const parsed = mapped.map(r => lesson.parse(r));
			const res = jsonDto(parsed, (lesson as any).array(), { requestId, status: 200 });
			res.headers.set('x-total-count', String((all ?? []).length));
			return res;
		} catch {
			return NextResponse.json({ error: { code: 'INTERNAL', message: 'Invalid lesson shape' }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
		}
	}
	const { data, error, count } = await supabase
		.from("lessons")
		.select("id,course_id,title,content,order_index,created_at", { count: 'exact' as any })
		.eq("course_id", query.course_id)
		.order("order_index", { ascending: true })
		.range(offset, offset + limit - 1);
	if (error) return NextResponse.json({ error: { code: "DB_ERROR", message: error.message }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
	try {
		const parsed = (data ?? []).map(r => lesson.parse(r));
		const res = jsonDto(parsed, (lesson as any).array(), { requestId, status: 200 });
		if (typeof count === 'number') res.headers.set('x-total-count', String(count));
		return res;
	} catch {
		return NextResponse.json({ error: { code: 'INTERNAL', message: 'Invalid lesson shape' }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
	}
}


