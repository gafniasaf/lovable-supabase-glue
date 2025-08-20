// @ts-nocheck
import { createQuizzesGateway } from "@/lib/data/quizzes";

export default async function TeacherQuizManagePage({ params }: { params: { courseId: string; quizId: string } }) {
  const questions: any[] = await createQuizzesGateway().listQuestions(params.quizId).catch(() => []);
  const questionsWithChoices = [] as Array<{ id: string; text: string; order_index: number; choices: any[] }>;
  for (const q of questions) {
    const choices = await createQuizzesGateway().listChoices(q.id).catch(() => [] as any[]);
    questionsWithChoices.push({ ...q, choices });
  }

  return (
    <section className="p-6 space-y-4" aria-label="Manage quiz">
      <h1 className="text-xl font-semibold">Manage Quiz</h1>
      <ol className="space-y-3" data-testid="questions-list">
        {questionsWithChoices.map(q => (
          <li key={q.id} className="border rounded p-3" data-testid="question-row">
            <div className="font-medium" data-testid="question-text">{q.text}</div>
            <ul className="mt-2 list-disc list-inside space-y-1" data-testid="choices-list">
              {q.choices.map((c: any) => (
                <li key={c.id} data-testid="choice-row">{c.text}{c.correct ? " (correct)" : ""}</li>
              ))}
              {q.choices.length === 0 && (<li className="text-gray-500">No choices yet.</li>)}
            </ul>
          </li>
        ))}
        {questionsWithChoices.length === 0 && (
          <li className="text-gray-500">No questions yet.</li>
        )}
      </ol>
      <a className="underline" href={`/dashboard/teacher/${params.courseId}/quizzes`}>Back to quizzes</a>
    </section>
  );
}


