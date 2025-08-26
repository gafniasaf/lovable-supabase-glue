import { headers, cookies } from "next/headers";
import { createAssignmentsGateway } from "@/lib/data/assignments";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Tabs, TabList, Tab } from "@/components/ui/Tabs";
import TeacherAssignmentsList from "@/ui/v0/TeacherAssignmentsList";

export default async function TeacherAssignmentsPage({ params }: { params: { courseId: string } }) {
  const h = headers();
  const cookieHeader = h.get("cookie") ?? "";
  const testAuth = h.get("x-test-auth") ?? cookies().get("x-test-auth")?.value;

  try {
    const rows = await createAssignmentsGateway().listByCourse(params.courseId);
    const items = (rows || []).map((a: any) => ({ id: a.id, title: a.title, dueAt: a.due_at ?? null, href: undefined as string | undefined }));
    const state: 'default' | 'empty' = (items.length === 0) ? 'empty' : 'default';
    return (
      <section className="p-6 space-y-3" aria-label="Assignments">
        <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/teacher" }, { label: "Course", href: `/dashboard/teacher/${params.courseId}` }, { label: "Assignments" }]} />
        <Tabs>
          <TabList>
            <Tab href={`/dashboard/teacher/${params.courseId}`}>Overview</Tab>
            <Tab href={`/dashboard/teacher/${params.courseId}/lessons/manage`}>Lessons</Tab>
            <Tab href={`/dashboard/teacher/${params.courseId}/modules`}>Modules</Tab>
            <Tab href={`/dashboard/teacher/${params.courseId}/assignments`} active>Assignments</Tab>
            <Tab href={`/dashboard/teacher/${params.courseId}/quizzes`}>Quizzes</Tab>
            <Tab href={`/dashboard/teacher/${params.courseId}/analytics`}>Analytics</Tab>
          </TabList>
        </Tabs>
        <TeacherAssignmentsList
          header={{ title: 'Assignments' }}
          actions={[{ id: 'new', label: 'New assignment', href: `/dashboard/teacher/${params.courseId}/assignments/new` }]}
          items={items as any}
          state={state}
        />
        <a className="underline" href={`/dashboard/teacher/${params.courseId}`}>Back to course</a>
      </section>
    );
  } catch (e: any) {
    return (
      <section className="p-6" aria-label="Assignments">
        <p className="text-gray-700">{String(e?.message || e)}</p>
      </section>
    );
  }
}


