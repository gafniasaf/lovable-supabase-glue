import { createQuizzesGateway } from "@/lib/data/quizzes";
import { getCurrentUser } from "@/lib/supabaseServer";
import Trans from "@/lib/i18n/Trans";
import StudentQuizHistory from "@/ui/v0/StudentQuizHistory";

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

  const rows: Array<{ id: string; title: string; score: number | null; submittedAt: string | null }> = [];
  for (const q of quizzes) {
    const attempts = await createQuizzesGateway().listAttemptsForQuiz(q.id).catch(() => [] as any[]);
    const mine = attempts.filter((a: any) => a.student_id === user.id);
    mine.sort((a: any, b: any) => (b.submitted_at || '').localeCompare(a.submitted_at || ''));
    const latest = mine[0] || null;
    rows.push({ id: q.id, title: q.title, score: latest?.score ?? null, submittedAt: latest?.submitted_at ?? null });
  }

  return (
    <StudentQuizHistory header={{ title: 'Quiz History' }} rows={rows as any} backHref={`/dashboard/student/${params.courseId}`} />
  );
}


