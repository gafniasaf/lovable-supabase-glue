import { headers, cookies } from "next/headers";
import { createQuizzesGateway } from "@/lib/data/quizzes";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Tabs, TabList, Tab } from "@/components/ui/Tabs";

type Quiz = { id: string; course_id: string; title: string; time_limit_sec?: number | null; points: number; created_at: string };

export default async function TeacherQuizzesPage({ params }: { params: { courseId: string } }) {
  const h = headers();
  const c = cookies();
  const cookieHeader = h.get("cookie") ?? c.getAll().map(x => `${x.name}=${x.value}`).join("; ");
  const testAuth = h.get("x-test-auth") ?? c.get("x-test-auth")?.value;

  const quizzes: Quiz[] = await createQuizzesGateway().listByCourse(params.courseId).catch(() => []);

  return (
    <section className="p-6 space-y-4" aria-label="Quizzes">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/teacher" }, { label: "Course", href: `/dashboard/teacher/${params.courseId}` }, { label: "Quizzes" }]} />
      <Tabs>
        <TabList>
          <Tab href={`/dashboard/teacher/${params.courseId}`}>Overview</Tab>
          <Tab href={`/dashboard/teacher/${params.courseId}/lessons/manage`}>Lessons</Tab>
          <Tab href={`/dashboard/teacher/${params.courseId}/modules`}>Modules</Tab>
          <Tab href={`/dashboard/teacher/${params.courseId}/assignments`}>Assignments</Tab>
          <Tab href={`/dashboard/teacher/${params.courseId}/quizzes`} active>Quizzes</Tab>
          <Tab href={`/dashboard/teacher/${params.courseId}/analytics`}>Analytics</Tab>
        </TabList>
      </Tabs>
      <h1 className="text-xl font-semibold">Quizzes</h1>
      {quizzes.length === 0 ? (
        <div className="text-gray-600">No quizzes yet.</div>
      ) : (
        <ul className="divide-y border rounded" data-testid="quizzes-list">
          {quizzes.map(q => (
            <li key={q.id} className="p-3" data-testid="quiz-row">
              <span data-testid="quiz-title">{q.title}</span>
            </li>
          ))}
        </ul>
      )}
      <a className="text-blue-600 underline" href={`/dashboard/teacher/${params.courseId}`}>Back to course</a>
    </section>
  );
}


