import { cookies, headers } from "next/headers";
import { createModulesGateway } from "@/lib/data/modules";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Tabs, TabList, Tab } from "@/components/ui/Tabs";
import TeacherModulesList from "@/ui/v0/TeacherModulesList";

type Module = { id: string; course_id: string; title: string; order_index: number; created_at: string };

export default async function CourseModulesPage({ params }: { params: { courseId: string } }) {
  const modules: Module[] = await createModulesGateway().listByCourse(params.courseId).catch(() => []);
  const items = (modules || []).map((m) => ({ id: m.id, order: m.order_index, title: m.title, href: undefined as string | undefined }));
  const state: 'default' | 'empty' = (items.length === 0) ? 'empty' : 'default';

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
      <TeacherModulesList
        header={{ title: 'Modules' }}
        actions={[]}
        items={items}
        state={state}
      />
      <a className="underline" href={`/dashboard/teacher/${params.courseId}`}>Back to course</a>
    </section>
  );
}


