// @ts-nocheck
import { headers, cookies } from "next/headers";
import { createAssignmentsGateway } from "@/lib/data/assignments";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Tabs, TabList, Tab } from "@/components/ui/Tabs";

export default async function TeacherAssignmentsPage({ params }: { params: { courseId: string } }) {
  const h = headers();
  const cookieHeader = h.get("cookie") ?? "";
  const testAuth = h.get("x-test-auth") ?? cookies().get("x-test-auth")?.value;

  try {
    const rows = await createAssignmentsGateway().listByCourse(params.courseId);
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
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Assignments</h1>
          <a className="underline" href={`/dashboard/teacher/${params.courseId}/assignments/new`}>New assignment</a>
        </div>
        <ol className="space-y-2" data-testid="assignments-list">
          {(rows ?? []).map((a: any) => (
            <li key={a.id} className="border rounded p-3" data-testid="assignment-row">
              <div className="font-medium" data-testid="assignment-title">{a.title}</div>
              <div className="text-gray-600 text-sm" data-testid="assignment-due">{a.due_at ?? "No due date"}</div>
            </li>
          ))}
          {(!rows || rows.length === 0) && (
            <li className="text-gray-500">No assignments yet.</li>
          )}
        </ol>
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


