import { headers, cookies } from "next/headers";
import { createLessonsGateway } from "@/lib/data/lessons";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Tabs, TabList, Tab } from "@/components/ui/Tabs";

export default async function ManageLessonsPage({ params }: { params: { courseId: string } }) {
  const h = headers();
  const c = cookies();
  const cookie = h.get('cookie') ?? c.getAll().map(x => `${x.name}=${x.value}`).join('; ');
  const testAuth = h.get('x-test-auth') ?? c.get('x-test-auth')?.value;
  const lessons = await createLessonsGateway().listByCourse(params.courseId).catch(() => []);
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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Manage lessons</h1>
        <Link className="underline" href={`/dashboard/teacher/${params.courseId}`}>Back</Link>
      </div>
      <ul className="space-y-2">
        {(lessons ?? []).map((l: any) => (
          <li key={l.id} className="border rounded p-3">
            <div className="font-medium">#{l.order_index} — {l.title}</div>
            {l.file_key ? (
              <div className="mt-1 text-sm flex items-center gap-2">
                <a className="underline" href={`/api/files/download-url?id=${encodeURIComponent(l.file_key)}`} target="_blank" rel="noreferrer">Attachment</a>
                <form action={`/api/files/attachment?key=${encodeURIComponent(l.file_key)}`} method="post">
                  <input type="hidden" name="_method" value="DELETE" />
                  <button className="underline text-xs" type="submit">Delete</button>
                </form>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No attachment</div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}


