/**
 * Quiz questions API
 *
 * POST /api/quiz-questions — create a question (teacher)
 * GET  /api/quiz-questions?quiz_id=... — list questions for a quiz
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withRouteTiming } from "@/server/withRouteTiming";
import { createApiHandler } from "@/server/apiHandler";
import { getCurrentUserInRoute } from "@/lib/supabaseServer";
import { quizQuestion, quizQuestionCreateRequest } from "@education/shared";
import { jsonDto } from "@/lib/jsonDto";
import { createQuestionApi, listQuestionsByQuizApi } from "@/server/services/quizzes";
import { parseQuery } from "@/lib/zodQuery";

export const POST = withRouteTiming(createApiHandler({
  schema: quizQuestionCreateRequest,
  preAuth: async (ctx) => {
    const user = await getCurrentUserInRoute();
    const role = (user?.user_metadata as any)?.role ?? undefined;
    if (!user) return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Not signed in" }, requestId: ctx.requestId }, { status: 401, headers: { 'x-request-id': ctx.requestId } });
    if (role !== "teacher") return NextResponse.json({ error: { code: "FORBIDDEN", message: "Teachers only" }, requestId: ctx.requestId }, { status: 403, headers: { 'x-request-id': ctx.requestId } });
    return null;
  },
  handler: async (input, ctx) => {
    const requestId = ctx.requestId;
    const row = await createQuestionApi(input!);
    try {
      const out = quizQuestion.parse(row);
      return jsonDto(out, quizQuestion as any, { requestId, status: 201 });
    } catch {
      return NextResponse.json({ error: { code: 'INTERNAL', message: 'Invalid question shape' }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
    }
  }
}));

const listQuizQuestionsQuery = z.object({ quiz_id: z.string().uuid() }).strict();

export const GET = withRouteTiming(async function GET(req) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  let query: { quiz_id: string };
  try {
    query = parseQuery(req, listQuizQuestionsQuery);
  } catch (e: any) {
    return NextResponse.json({ error: { code: "BAD_REQUEST", message: e.message }, requestId }, { status: 400, headers: { 'x-request-id': requestId } });
  }
  const user = await getCurrentUserInRoute(req as any);
  if (!user) return NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Not signed in" }, requestId }, { status: 401, headers: { 'x-request-id': requestId } });
  const list = await listQuestionsByQuizApi(query.quiz_id);
  try {
    const parsed = (list ?? []).map(q => quizQuestion.parse(q));
    return jsonDto(parsed, (quizQuestion as any).array(), { requestId, status: 200 });
  } catch (e) {
    return NextResponse.json({ error: { code: 'INTERNAL', message: 'Invalid question shape' }, requestId }, { status: 500, headers: { 'x-request-id': requestId } });
  }
});


