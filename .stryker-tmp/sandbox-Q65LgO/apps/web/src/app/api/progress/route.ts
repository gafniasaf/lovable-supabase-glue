// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { withRouteTiming } from "@/server/withRouteTiming";
import { getCurrentUserInRoute, getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { isTestMode } from "@/lib/testMode";
import { getTestProfile } from "@/lib/testStore";
import { z } from "zod";
import { parseQuery } from "@/lib/zodQuery";

const progressQuery = z.object({ course_id: z.string().uuid(), for_teacher: z.string().optional(), per_student: z.string().optional() }).strict();

export const GET = withRouteTiming(async function GET(req: NextRequest) {
	const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
	const user = await getCurrentUserInRoute(req);
	if (!user) return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Not signed in' }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
	let q: { course_id: string; for_teacher?: string; per_student?: string };
	try {
		q = parseQuery(req, progressQuery);
	} catch (e: any) {
		return NextResponse.json({ error: { code: 'BAD_REQUEST', message: e.message }, requestId }, { status: 400, headers: { 'x-request-id': requestId } });
	}
	const courseId = q.course_id;
	const forTeacher = (q.for_teacher || '') === '1';
	const perStudent = (q.per_student || '') === '1';
	if (isTestMode()) {
		if (perStudent) {
			return NextResponse.json({ students: [] }, { status: 200, headers: { 'x-request-id': requestId } });
		}
		return NextResponse.json({}, { status: 200, headers: { 'x-request-id': requestId } });
	}
	const supabase = getRouteHandlerSupabase();
	const { data: lessons, error: errLessons } = await supabase.from('lessons').select('id').eq('course_id', courseId);
	if (errLessons) return NextResponse.json({ error: { code: 'DB_ERROR', message: errLessons.message }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
	const ids = (lessons ?? []).map((l: any) => l.id);
	if (ids.length === 0) return NextResponse.json(perStudent ? { students: [] } : {}, { status: 200, headers: { 'x-request-id': requestId } });
	const isTeacher = (user?.user_metadata as any)?.role === 'teacher';
	if (perStudent) {
		if (!isTeacher) return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Teachers only' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
		// Enforce ownership: teacher must own the course to view per-student aggregates
		const { data: courseRow, error: errCourse } = await supabase.from('courses').select('id,teacher_id').eq('id', courseId).single();
		if (errCourse) return NextResponse.json({ error: { code: 'DB_ERROR', message: errCourse.message }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
		if (!courseRow || (courseRow as any).teacher_id !== user.id) return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Teachers only (own course)' }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
		const { data: enr, error: errEnr } = await supabase.from('enrollments').select('student_id').eq('course_id', courseId);
		if (errEnr) return NextResponse.json({ error: { code: 'DB_ERROR', message: errEnr.message }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
		const studentIds = (enr ?? []).map((e: any) => e.student_id);
		if (studentIds.length === 0) return NextResponse.json({ students: [] }, { status: 200, headers: { 'x-request-id': requestId } });
		const { data: progRows, error: errProg } = await supabase
			.from('progress')
			.select('lesson_id,user_id')
			.in('lesson_id', ids)
			.in('user_id', studentIds);
		if (errProg) return NextResponse.json({ error: { code: 'DB_ERROR', message: errProg.message }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
		const completedByUser: Record<string, number> = {};
		for (const row of (progRows ?? [])) {
			const uid = (row as any).user_id as string;
			completedByUser[uid] = (completedByUser[uid] || 0) + 1;
		}
		// Resolve display names
		const { data: profileRows, error: errProf } = await supabase
			.from('profiles')
			.select('id,display_name,email')
			.in('id', studentIds);
		if (errProf) return NextResponse.json({ error: { code: 'DB_ERROR', message: errProf.message }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
		const nameById = new Map<string, string>();
		for (const p of (profileRows ?? []) as any[]) {
			nameById.set(p.id, (p.display_name as string) || (p.email as string) || p.id);
		}
		const total = ids.length;
		const students = studentIds.map(sid => ({
			student_id: sid,
			completedLessons: completedByUser[sid] || 0,
			totalLessons: total,
			percent: total > 0 ? Math.round(((completedByUser[sid] || 0) / total) * 100) : 0,
			name: nameById.get(sid) || sid
		}));
		return NextResponse.json({ students }, { status: 200, headers: { 'x-request-id': requestId } });
	}
	const query = supabase.from('progress').select('lesson_id,user_id').in('lesson_id', ids);
	const { data, error } = forTeacher && isTeacher ? await query : await query.eq('user_id', user.id);
	if (error) return NextResponse.json({ error: { code: 'DB_ERROR', message: error.message }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
	if (forTeacher && isTeacher) {
		const counts: Record<string, number> = {};
		for (const row of data ?? []) counts[(row as any).lesson_id] = (counts[(row as any).lesson_id] || 0) + 1;
		return NextResponse.json({ counts }, { status: 200, headers: { 'x-request-id': requestId } });
	} else {
		const map: Record<string, true> = {};
		for (const row of data ?? []) map[(row as any).lesson_id] = true;
		return NextResponse.json(map, { status: 200, headers: { 'x-request-id': requestId } });
	}
});


