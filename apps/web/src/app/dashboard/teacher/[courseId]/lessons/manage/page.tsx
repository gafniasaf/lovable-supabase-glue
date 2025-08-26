import { headers, cookies } from "next/headers";
import { createLessonsGateway } from "@/lib/data/lessons";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Tabs, TabList, Tab } from "@/components/ui/Tabs";
import TeacherLessonsManageList from "@/ui/v0/TeacherLessonsManageList";

export default async function ManageLessonsPage({ params }: { params: { courseId: string } }) {
  const h = headers();
  const c = cookies();
  const cookie = h.get('cookie') ?? c.getAll().map(x => `${x.name}=${x.value}`).join('; ');
  const testAuth = h.get('x-test-auth') ?? c.get('x-test-auth')?.value;
  const lessons = await createLessonsGateway().listByCourse(params.courseId).catch(() => []);
  const items = (lessons || []).map((l: any) => ({
    id: l.id,
    order: l.order_index,
    title: l.title,
    attachmentHref: l.file_key ? `/api/files/download-url?id=${encodeURIComponent(l.file_key)}` : null,
    deleteAttachmentHref: l.file_key ? `/api/files/attachment?key=${encodeURIComponent(l.file_key)}` : null,
  }));
  const state: 'default' | 'empty' = (items.length === 0) ? 'empty' : 'default';
  return (
    <section className="p-6 space-y-4" aria-label="Manage lessons">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/teacher" }, { label: "Course", href: `/dashboard/teacher/${params.courseId}` }, { label: "Lessons" }]} />
      <Tabs>
        <TabList>
          <Tab href={`/dashboard/teacher/${params.courseId}`}>Overview</Tab>
          <Tab href={`/dashboard/teacher/${params.courseId}/lessons/manage`} active>Lessons</Tab>
          <Tab href={`/dashboard/teacher/${params.courseId}/modules`}>Modules</Tab>
          <Tab href={`/dashboard/teacher/${params.courseId}/assignments`}>Assignments</Tab>
          <Tab href={`/dashboard/teacher/${params.courseId}/quizzes`}>Quizzes</Tab>
          <Tab href={`/dashboard/teacher/${params.courseId}/analytics`}>Analytics</Tab>
        </TabList>
      </Tabs>
      <TeacherLessonsManageList header={{ title: 'Manage lessons' }} items={items as any} backHref={`/dashboard/teacher/${params.courseId}`} state={state} />
    </section>
  );
}


