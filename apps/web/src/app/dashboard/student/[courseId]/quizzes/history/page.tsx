import { createQuizzesGateway } from "@/lib/data/quizzes";
import { getCurrentUser } from "@/lib/supabaseServer";
import Trans from "@/lib/i18n/Trans";

type Quiz = { id: string; course_id: string; title: string; time_limit_sec?: number | null; points: number; created_at: string };

export default async function StudentQuizHistoryPage({ params }: { params: { courseId: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <section className="p-6" aria-label="Quiz history">
        <p className="text-gray-700"><Trans keyPath="auth.notSignedIn" fallback="You are not signed in." /> <a className="underline" href="/login"><Trans keyPath="auth.signin" fallback="Sign in" /></a></p>
      </section>
    );
  }

  const quizzes: Quiz[] = await createQuizzesGateway().listByCourse(params.courseId).catch(() => []);

  const rows: Array<{ id: string; title: string; score: number | null; submitted_at: string | null }> = [];
  for (const q of quizzes) {
    const attempts = await createQuizzesGateway().listAttemptsForQuiz(q.id).catch(() => [] as any[]);
    const mine = attempts.filter((a: any) => a.student_id === user.id);
    mine.sort((a: any, b: any) => (b.submitted_at || '').localeCompare(a.submitted_at || ''));
    const latest = mine[0] || null;
    rows.push({ id: q.id, title: q.title, score: latest?.score ?? null, submitted_at: latest?.submitted_at ?? null });
  }

  return (
    <section className="p-6 space-y-4" aria-label="Quiz history">
      <h1 className="text-xl font-semibold">Quiz History</h1>
      <table className="w-full border" data-testid="quiz-history-list">
        <thead>
          <tr className="bg-gray-50 text-left">
            <th className="p-2">Quiz</th>
            <th className="p-2">Submitted</th>
            <th className="p-2">Score</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => {
            const hasSubmission = !!r.submitted_at;
            const scoreDisplay = r.score != null ? String(r.score) : (hasSubmission ? '0' : '-');
            return (
              <tr key={r.id} className="border-t" data-testid="history-row">
                <td className="p-2" data-testid="history-quiz-title">{r.title}</td>
                <td className="p-2">{r.submitted_at ?? '-'}</td>
                <td className="p-2" data-testid="history-score">{scoreDisplay}</td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <td className="p-2 text-gray-500" colSpan={3}>No quizzes yet.</td>
            </tr>
          )}
        </tbody>
      </table>
      <a className="underline" href={`/dashboard/student/${params.courseId}`}>Back to course</a>
    </section>
  );
}


