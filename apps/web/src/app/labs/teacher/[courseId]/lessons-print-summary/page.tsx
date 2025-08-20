import { headers, cookies } from "next/headers";
import { createLessonsGateway } from "@/lib/data/lessons";

type Lesson = {
  id: string;
  course_id: string;
  title: string;
  content: string;
  order_index: number;
  created_at: string;
};

function previewContent(text: string, max = 100): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? clean.slice(0, max - 1) + "…" : clean;
}

export default async function LessonsPrintSummaryPage({ params }: { params: { courseId: string } }) {
  const h = headers();
  const c = cookies();
  const cookieHeader = h.get("cookie") ?? c.getAll().map(x => `${x.name}=${x.value}`).join("; ");
  const testAuth = h.get("x-test-auth") ?? c.get("x-test-auth")?.value;

  let lessons: Lesson[] = [];
  try { lessons = await createLessonsGateway().listByCourse(params.courseId) as any; } catch {}
  if (!lessons) {
    return (
      <main className="p-6">
        <a className="text-blue-600 underline" href="/login">Sign in</a>
      </main>
    );
  }

  

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold mb-4">Printable lessons summary</h1>
      {lessons.length === 0 ? (
        <div className="text-gray-600">No lessons yet.</div>
      ) : (
        <ol className="space-y-3" data-testid="print-lessons">
          {lessons.map(lesson => (
            <li key={lesson.id} data-testid="print-lesson-row">
              <div className="font-medium">
                <span data-testid="lesson-order">#{lesson.order_index}</span>
                <span className="mx-2">-</span>
                <span data-testid="lesson-title">{lesson.title}</span>
              </div>
              <div className="text-gray-700" data-testid="lesson-preview">{previewContent(lesson.content)}</div>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}


