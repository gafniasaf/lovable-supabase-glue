import { cookies, headers } from "next/headers";
import { createModulesGateway } from "@/lib/data/modules";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Tabs, TabList, Tab } from "@/components/ui/Tabs";

type Module = { id: string; course_id: string; title: string; order_index: number; created_at: string };

export default async function CourseModulesPage({ params }: { params: { courseId: string } }) {
  const modules: Module[] = await createModulesGateway().listByCourse(params.courseId).catch(() => []);

  return (
    <section className="p-6 space-y-3" aria-label="Modules">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/teacher" }, { label: "Course", href: `/dashboard/teacher/${params.courseId}` }, { label: "Modules" }]} />
      <Tabs>
        <TabList>
          <Tab href={`/dashboard/teacher/${params.courseId}`}>Overview</Tab>
          <Tab href={`/dashboard/teacher/${params.courseId}/lessons/manage`}>Lessons</Tab>
          <Tab href={`/dashboard/teacher/${params.courseId}/modules`} active>Modules</Tab>
          <Tab href={`/dashboard/teacher/${params.courseId}/assignments`}>Assignments</Tab>
          <Tab href={`/dashboard/teacher/${params.courseId}/quizzes`}>Quizzes</Tab>
          <Tab href={`/dashboard/teacher/${params.courseId}/analytics`}>Analytics</Tab>
        </TabList>
      </Tabs>
      <h1 className="text-xl font-semibold">Modules</h1>
      <ul className="space-y-2" data-testid="modules-list">
        {modules.map(m => (
          <li key={m.id} className="border rounded p-2" data-testid="module-row">
            <span className="font-medium" data-testid="module-title">#{m.order_index} - {m.title}</span>
          </li>
        ))}
        {(!modules || modules.length === 0) && (
          <li className="text-gray-500">No modules yet.</li>
        )}
      </ul>
      <a className="underline" href={`/dashboard/teacher/${params.courseId}`}>Back to course</a>
    </section>
  );
}


