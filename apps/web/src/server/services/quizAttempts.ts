/**
 * Quiz attempt service functions
 *
 * - startAttemptApi: Start an attempt (student)
 * - upsertAnswerApi: Upsert an answer for a question
 * - submitAttemptApi: Submit attempt and compute score
 * - listAttemptsForQuiz: List attempts for a quiz (teacher)
 * - getAttemptForStudent: Fetch latest attempt for a student in a quiz
 */
import { getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { isTestMode } from "@/lib/testMode";
import {
  startAttempt as startTestAttempt,
  upsertAnswer as upsertTestAnswer,
  submitAttempt as submitTestAttempt,
  listAttemptsForQuiz as listTestAttemptsForQuiz,
  getAttemptForStudent as getTestAttemptForStudent
} from "@/lib/testStore";

type StartAttemptInput = { quiz_id: string; student_id: string };
type UpsertAnswerInput = { attempt_id: string; question_id: string; choice_id: string };
type SubmitAttemptInput = { attempt_id: string };

export async function startAttemptApi(input: StartAttemptInput) {
  // Start a new attempt for a quiz by the given student.
  if (isTestMode()) return startTestAttempt(input);
  const supabase = getRouteHandlerSupabase();
  // Enforce one active attempt and record started_at
  const { data: existing } = await supabase
    .from('quiz_attempts')
    .select('id,submitted_at,started_at')
    .eq('quiz_id', input.quiz_id)
    .eq('student_id', input.student_id)
    .order('started_at', { ascending: false })
    .limit(1);
  if (existing && existing[0] && !existing[0].submitted_at) return existing[0];
  const { data, error } = await supabase
    .from("quiz_attempts")
    .insert({ quiz_id: input.quiz_id, student_id: input.student_id })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function upsertAnswerApi(input: UpsertAnswerInput) {
  // Upsert a single answer for the attempt/question combination.
  if (isTestMode()) return upsertTestAnswer(input);
  const supabase = getRouteHandlerSupabase();
  // Upsert via delete+insert for simplicity
  await supabase.from("quiz_answers").delete().eq("attempt_id", input.attempt_id).eq("question_id", input.question_id);
  const { data, error } = await supabase
    .from("quiz_answers")
    .insert({ attempt_id: input.attempt_id, question_id: input.question_id, choice_id: input.choice_id })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function submitAttemptApi(input: SubmitAttemptInput) {
  // Submit an attempt and compute the score based on correct choices.
  if (isTestMode()) return submitTestAttempt(input);
  const supabase = getRouteHandlerSupabase();
  // Compute score server-side in DB could be complex; MVP: join and count correct
  const { data: answers, error: answersErr } = await supabase
    .from("quiz_answers")
    .select("question_id, choice_id, quiz_attempts!inner(quiz_id)")
    .eq("attempt_id", input.attempt_id);
  if (answersErr) throw new Error(answersErr.message);

  if (!answers || answers.length === 0) {
    const { data, error } = await supabase
      .from("quiz_attempts")
      .update({ submitted_at: new Date().toISOString(), score: 0 })
      .eq("id", input.attempt_id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  const quizId = (answers[0] as any).quiz_attempts.quiz_id as string;
  const { data: questions, error: qErr } = await supabase
    .from("quiz_questions")
    .select("id")
    .eq("quiz_id", quizId);
  if (qErr) throw new Error(qErr.message);
  const total = questions?.length ?? 0;

  const { data: correctChoices, error: cErr } = await supabase
    .from("quiz_choices")
    .select("question_id, id")
    .in("question_id", (questions ?? []).map(q => q.id))
    .eq("correct", true);
  if (cErr) throw new Error(cErr.message);
  const correctByQuestion = new Map((correctChoices ?? []).map(r => [r.question_id, r.id] as const));

  let correct = 0;
  for (const a of answers as any[]) {
    if (correctByQuestion.get(a.question_id) === a.choice_id) correct++;
  }

  const { data: quizRow } = await supabase.from("quizzes").select("points").eq("id", quizId).single();
  const points = quizRow?.points ?? 100;
  const score = total > 0 ? Math.round((correct / total) * points) : 0;

  const { data, error } = await supabase
    .from("quiz_attempts")
    .update({ submitted_at: new Date().toISOString(), score })
    .eq("id", input.attempt_id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function listAttemptsForQuiz(quiz_id: string) {
  // List attempts for a quiz, newest first.
  if (isTestMode()) return listTestAttemptsForQuiz(quiz_id);
  const supabase = getRouteHandlerSupabase();
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("id,quiz_id,student_id,started_at,submitted_at,score")
    .eq("quiz_id", quiz_id)
    .order("started_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getAttemptForStudent(quiz_id: string, student_id: string) {
  // Get the most recent attempt for a specific student in a quiz.
  if (isTestMode()) return getTestAttemptForStudent(quiz_id, student_id);
  const supabase = getRouteHandlerSupabase();
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("id,quiz_id,student_id,started_at,submitted_at,score")
    .eq("quiz_id", quiz_id)
    .eq("student_id", student_id)
    .order("started_at", { ascending: false })
    .limit(1);
  if (error) throw new Error(error.message);
  return data?.[0] ?? null;
}


