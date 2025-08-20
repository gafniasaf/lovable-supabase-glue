// @ts-nocheck
import { NextResponse } from "next/server";
import { withRouteTiming } from "@/server/withRouteTiming";
import { getCurrentUserInRoute } from "@/lib/supabaseServer";
import { quizAttemptSubmitRequest, quizAttempt } from "@education/shared";
import { submitAttemptApi } from "@/server/services/quizAttempts";
import { getRouteHandlerSupabase } from "@/lib/supabaseServer";

export const POST = withRouteTiming(async function POST(req: Request) {
	const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
	const user = await getCurrentUserInRoute();
	const role = (user?.user_metadata as any)?.role ?? undefined;
	if (!user) return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Not signed in" }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
	if (role !== "student") return NextResponse.json({ error: { code: "FORBIDDEN", message: "Students only" }, requestId }, { status: 403, headers: { 'x-request-id': requestId } });
	const body = await req.json();
	const { attempt_id } = quizAttemptSubmitRequest.parse(body);
	// Enforce time limit at submit: if time is up, still submit
	try {
		const supabase = getRouteHandlerSupabase();
		const { data: attemptRow } = await supabase.from('quiz_attempts').select('quiz_id,started_at,submitted_at').eq('id', attempt_id).single();
		if (!attemptRow) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Attempt not found' }, requestId }, { status: 404, headers: { 'x-request-id': requestId } });
		if (!attemptRow.submitted_at) {
			const { data: quizRow } = await supabase.from('quizzes').select('time_limit_sec').eq('id', attemptRow.quiz_id).single();
			const tl = (quizRow as any)?.time_limit_sec ?? null;
			if (tl && tl > 0) {
				const started = new Date((attemptRow as any).started_at).getTime();
				const deadline = started + tl * 1000;
				if (Date.now() > deadline) {
					// Time exceeded; proceed to submit (score computed from saved answers)
				}
			}
		}
	} catch {}
	const out = await submitAttemptApi({ attempt_id });
	try { return NextResponse.json(quizAttempt.parse(out as any), { status: 200 }); } catch { return NextResponse.json({ error: { code: 'INTERNAL', message: 'Invalid attempt shape' }, requestId }, { status: 500, headers: { 'x-request-id': requestId } }); }
});


