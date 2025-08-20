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

async function fetchLessonsForCourse(courseId: string): Promise<Lesson[]> {
  try { return await createLessonsGateway().listByCourse(courseId) as any; } catch { return []; }
}

export default async function CoursesPrintPackPage({ searchParams }: { searchParams?: { ids?: string } }) {
  const h = headers();
  const c = cookies();
  const cookieHeader = h.get("cookie") ?? c.getAll().map(x => `${x.name}=${x.value}`).join("; ");
  const testAuth = h.get("x-test-auth") ?? c.get("x-test-auth")?.value;

  const idsParam = searchParams?.ids?.trim() ?? "";
  const courseIds = idsParam
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  if (courseIds.length === 0) {
    return (
      <main className="p-6 space-y-4">
        <h1 className="text-xl font-semibold">Courses print pack</h1>
        <div className="text-gray-600">No courses selected.</div>
      </main>
    );
  }

  const sections: { courseId: string; lessons: Lesson[] }[] = [];
  for (const id of courseIds) {
    const lessons = await fetchLessonsForCourse(id);
    sections.push({ courseId: id, lessons });
  }

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold">Courses print pack</h1>
        <span className="text-gray-600">(total:</span>
        <span data-testid="print-pack-total-courses">{String(sections.length)}</span>
        <span className="text-gray-600">)</span>
      </div>

      {sections.map(({ courseId, lessons }) => (
        <section key={courseId} className="border rounded p-4" data-testid="print-pack-course">
          <div className="text-lg font-medium mb-3">Course: {courseId}</div>
          {lessons.length === 0 ? (
            <div className="text-gray-600">No lessons yet.</div>
          ) : (
            <ol className="space-y-2">
              {lessons.map((l) => (
                <li key={l.id} data-testid="print-pack-lesson-row">
                  <div className="font-medium">
                    <span data-testid="lesson-order">#{l.order_index}</span>
                    <span className="mx-2">-</span>
                    <span data-testid="lesson-title">{l.title}</span>
                  </div>
                  <div className="text-gray-700" data-testid="lesson-preview">{previewContent(l.content)}</div>
                </li>
              ))}
            </ol>
          )}
        </section>
      ))}
    </main>
  );
}


