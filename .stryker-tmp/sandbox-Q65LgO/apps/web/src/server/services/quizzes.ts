/**
 * Quiz service functions (test-mode only for now)
 *
 * - createQuizApi, listQuizzesByCourseApi, updateQuizApi, deleteQuizApi
 * - createQuestionApi, listQuestionsByQuizApi
 * - createChoiceApi, listChoicesByQuestionApi
 */
// @ts-nocheck

import { isTestMode } from "@/lib/testMode";
import { getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { addQuiz, listQuizzesByCourse, updateQuiz, deleteQuiz, addQuestion, listQuestionsByQuiz, addChoice, listChoicesByQuestion } from "@/lib/testStore";

export async function createQuizApi(input: { course_id: string; title: string; time_limit_sec?: number | null; points?: number }) {
  // Create a quiz in test-mode. Real DB not implemented in this MVP.
  if (isTestMode()) {
    return addQuiz({ course_id: input.course_id, title: input.title, time_limit_sec: input.time_limit_sec ?? undefined, points: input.points });
  }
  const supabase = getRouteHandlerSupabase();
  const { data, error } = await supabase
    .from("quizzes")
    .insert({
      course_id: input.course_id,
      title: input.title,
      time_limit_sec: input.time_limit_sec ?? null,
      points: input.points ?? 100
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function listQuizzesByCourseApi(courseId: string) {
  // List quizzes for a course in test-mode.
  if (isTestMode()) {
    return listQuizzesByCourse(courseId);
  }
  const supabase = getRouteHandlerSupabase();
  const { data, error } = await supabase
    .from("quizzes")
    .select("id,course_id,title,time_limit_sec,points,created_at")
    .eq("course_id", courseId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listQuizzesByCoursePaged(
  courseId: string,
  options?: { offset?: number; limit?: number }
): Promise<{ rows: any[]; total: number }>
{
  const offset = Math.max(0, options?.offset ?? 0);
  const limit = Math.max(1, Math.min(200, options?.limit ?? 50));
  if (isTestMode()) {
    const all = (listQuizzesByCourse as any)(courseId) as any[];
    const rows = (all ?? []).slice(offset, offset + limit);
    return { rows, total: (all ?? []).length };
  }
  const supabase = getRouteHandlerSupabase();
  const { data, error, count } = await supabase
    .from('quizzes')
    .select('id,course_id,title,time_limit_sec,points,created_at', { count: 'exact' as any })
    .eq('course_id', courseId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw new Error(error.message);
  return { rows: data ?? [], total: typeof count === 'number' ? count : 0 };
}

export async function updateQuizApi(id: string, data: { title?: string; time_limit_sec?: number | null; points?: number }) {
  // Update quiz fields in test-mode.
  if (isTestMode()) {
    return updateQuiz(id, { title: data.title, time_limit_sec: data.time_limit_sec ?? undefined, points: data.points });
  }
  const supabase = getRouteHandlerSupabase();
  const { data: row, error } = await supabase
    .from("quizzes")
    .update({
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.time_limit_sec !== undefined ? { time_limit_sec: data.time_limit_sec } : {}),
      ...(data.points !== undefined ? { points: data.points } : {})
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return row;
}

export async function deleteQuizApi(id: string) {
  // Delete a quiz in test-mode.
  if (isTestMode()) {
    return deleteQuiz(id);
  }
  const supabase = getRouteHandlerSupabase();
  const { error } = await supabase.from("quizzes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true } as const;
}

export async function createQuestionApi(input: { quiz_id: string; text: string; order_index?: number }) {
  // Create question in test-mode.
  if (isTestMode()) {
    return addQuestion(input);
  }
  const supabase = getRouteHandlerSupabase();
  const { data, error } = await supabase
    .from("quiz_questions")
    .insert({ quiz_id: input.quiz_id, text: input.text, order_index: input.order_index ?? 1 })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function listQuestionsByQuizApi(quizId: string) {
  // List questions in test-mode.
  if (isTestMode()) {
    return listQuestionsByQuiz(quizId);
  }
  const supabase = getRouteHandlerSupabase();
  const { data, error } = await supabase
    .from("quiz_questions")
    .select("id,quiz_id,text,order_index")
    .eq("quiz_id", quizId)
    .order("order_index", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createChoiceApi(input: { question_id: string; text: string; correct: boolean; order_index?: number }) {
  // Create choice in test-mode.
  if (isTestMode()) {
    return addChoice(input);
  }
  const supabase = getRouteHandlerSupabase();
  const { data, error } = await supabase
    .from("quiz_choices")
    .insert({ question_id: input.question_id, text: input.text, correct: input.correct, order_index: input.order_index ?? 1 })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function listChoicesByQuestionApi(questionId: string) {
  // List choices in test-mode.
  if (isTestMode()) {
    return listChoicesByQuestion(questionId);
  }
  const supabase = getRouteHandlerSupabase();
  const { data, error } = await supabase
    .from("quiz_choices")
    .select("id,question_id,text,correct,order_index")
    .eq("question_id", questionId)
    .order("order_index", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

