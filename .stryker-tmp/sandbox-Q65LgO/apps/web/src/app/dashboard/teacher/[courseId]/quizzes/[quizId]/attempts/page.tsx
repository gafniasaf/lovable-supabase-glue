// @ts-nocheck
import { createQuizzesGateway } from "@/lib/data/quizzes";

export default async function TeacherQuizAttemptsPage({ params }: { params: { courseId: string; quizId: string } }) {
  const rows = await createQuizzesGateway().listAttemptsForQuiz(params.quizId).catch(() => []);

  return (
    <section className="p-6 space-y-4" aria-label="Quiz attempts">
      <h1 className="text-xl font-semibold">Quiz Attempts</h1>
      <table className="w-full border" data-testid="attempts-list">
        <thead>
          <tr className="bg-gray-50 text-left">
            <th className="p-2">Student</th>
            <th className="p-2">Started</th>
            <th className="p-2">Submitted</th>
            <th className="p-2">Score</th>
          </tr>
        </thead>
        <tbody>
          {(rows ?? []).map((a: any) => (
            <tr key={a.id} className="border-t" data-testid="attempt-row">
              <td className="p-2" data-testid="attempt-student-id">{a.student_id}</td>
              <td className="p-2">{a.started_at}</td>
              <td className="p-2">{a.submitted_at ?? "-"}</td>
              <td className="p-2" data-testid="attempt-score">{a.score ?? 0}</td>
            </tr>
          ))}
          {(!rows || rows.length === 0) && (
            <tr>
              <td className="p-2 text-gray-500" colSpan={4}>No attempts yet.</td>
            </tr>
          )}
        </tbody>
      </table>
      <a className="underline" href={`/dashboard/teacher/${params.courseId}/quizzes`}>Back to quizzes</a>
    </section>
  );
}


