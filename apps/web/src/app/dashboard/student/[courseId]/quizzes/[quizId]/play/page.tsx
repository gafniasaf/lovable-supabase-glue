import { headers, cookies } from "next/headers";
import { getCurrentUser } from "@/lib/supabaseServer";
import { getServerComponentSupabase } from "@/lib/supabaseServer";
import dynamic from "next/dynamic";
import { createQuizzesGateway } from "@/lib/data/quizzes";
const QuizPlayerClient = dynamic(() => import("./QuizPlayerClient"), { ssr: false });

type Question = { id: string; quiz_id: string; text: string; order_index: number };

type Choice = { id: string; question_id: string; text: string; correct: boolean; order_index: number };

export default async function StudentQuizPlayPage({ params }: { params: { courseId: string; quizId: string } }) {
  const h = headers();
  const c = cookies();
  const cookieHeader = h.get("cookie") ?? c.getAll().map(x => `${x.name}=${x.value}`).join("; ");
  const testAuth = h.get("x-test-auth") ?? c.get("x-test-auth")?.value;

  const user = await getCurrentUser();
  let existingAttempt: any = null;
  if (user) {
    const list = await createQuizzesGateway().listAttemptsForQuiz(params.quizId).catch(() => [] as any[]);
    const mine = list.filter((a: any) => a.student_id === user.id);
    mine.sort((a: any, b: any) => (b.started_at || '').localeCompare(a.started_at || ''));
    existingAttempt = mine[0] || null;
  }
  if (existingAttempt && existingAttempt.submitted_at) {
    return (
      <section className="p-6 space-y-4" data-testid="quiz-player" aria-label="Quiz">
        <h1 className="text-xl font-semibold">Quiz</h1>
        <div className="rounded border p-4 inline-block">
          <div>Submission found.</div>
          <div className="mt-2">Score: <span data-testid="quiz-score">{existingAttempt.score}</span></div>
        </div>
      </section>
    );
  }

  // Load questions and choices via gateway
  const questions = await createQuizzesGateway().listQuestions(params.quizId).catch(() => [] as any) as Question[];
  const choicesByQuestion: Record<string, Choice[]> = {};
  for (const q of questions) {
    choicesByQuestion[q.id] = await createQuizzesGateway().listChoices(q.id).catch(() => [] as any) as Choice[];
  }

  // Time limit enforcement: compute remaining time if attempt exists
  let secondsLeftInitial: number | null = null;
  if (existingAttempt) {
    const supabase = getServerComponentSupabase();
    const { data: quiz } = await supabase.from('quizzes').select('time_limit_sec, created_at').eq('id', params.quizId).single();
    const tl = (quiz as any)?.time_limit_sec ?? null;
    if (tl && tl > 0) {
      const started = new Date((existingAttempt as any).started_at).getTime();
      const deadline = started + tl * 1000;
      const remainingMs = Math.max(0, deadline - Date.now());
      secondsLeftInitial = Math.floor(remainingMs / 1000);
    }
  }

  return (
    <section className="p-6 space-y-4" data-testid="quiz-player" aria-label="Quiz">
      <h1 className="text-xl font-semibold">Quiz</h1>
      <QuizPlayerClient quizId={params.quizId} questions={questions} choicesByQuestion={choicesByQuestion as any} timeLimitSec={5} existingAttemptId={existingAttempt?.id ?? null} secondsLeftInitial={secondsLeftInitial} />
    </section>
  );
}


