import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AnnouncementAttachment } from "./Attachment";
import { createAnnouncementsGateway } from "@/lib/data/announcements";
import { createFilesGateway } from "@/lib/data/files";
import { uploadBinaryToUrl } from "@/lib/files";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Tabs, TabList, Tab } from "@/components/ui/Tabs";

type Params = { courseId: string };

type Announcement = { id: string; course_id: string; title: string; body: string; created_at: string };

export default async function TeacherCourseAnnouncementsPage({ params }: { params: Params }) {
  const rows: Announcement[] = await createAnnouncementsGateway().listByCourse(params.courseId).catch(() => []);

  async function createAction(formData: FormData): Promise<void> {
    "use server";
    const title = String(formData.get("title") || "").trim();
    const body = String(formData.get("body") || "").trim();
    const publishRaw = String(formData.get("publish_at") || "").trim();
    const publish_at = publishRaw ? new Date(publishRaw).toISOString() : null;
    let file_key: string | undefined = undefined;
    try {
      const f = formData.get('file') as unknown as File | null;
      if (f && typeof (f as any).arrayBuffer === 'function') {
        const ct = (f as any).type || 'application/octet-stream';
        const up = await createFilesGateway().getUploadUrl({ owner_type: 'announcement', owner_id: params.courseId, content_type: ct, filename: (f as any).name || undefined });
        const ab = await (f as any).arrayBuffer();
        await uploadBinaryToUrl(up.url, ab, { method: up.method, headers: up.headers as any });
        if ((up as any).key) file_key = String((up as any).key);
      }
    } catch {}
    await createAnnouncementsGateway().create({ course_id: params.courseId, title, body, publish_at, ...(file_key ? { file_key } : {}) } as any);
    revalidatePath(`/dashboard/teacher/${params.courseId}/announcements`);
    redirect(`/dashboard/teacher/${params.courseId}/announcements`);
  }

  async function deleteAction(formData: FormData): Promise<void> {
    "use server";
    const id = String(formData.get("id") || "");
    await createAnnouncementsGateway().delete(id);
    revalidatePath(`/dashboard/teacher/${params.courseId}/announcements`);
    redirect(`/dashboard/teacher/${params.courseId}/announcements`);
  }

  return (
    <section className="p-6 space-y-4" aria-label="Announcements">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/teacher" }, { label: "Course", href: `/dashboard/teacher/${params.courseId}` }, { label: "Announcements" }]} />
      <Tabs>
        <TabList>
          <Tab href={`/dashboard/teacher/${params.courseId}`}>Overview</Tab>
          <Tab href={`/dashboard/teacher/${params.courseId}/lessons/manage`}>Lessons</Tab>
          <Tab href={`/dashboard/teacher/${params.courseId}/modules`}>Modules</Tab>
          <Tab href={`/dashboard/teacher/${params.courseId}/assignments`}>Assignments</Tab>
          <Tab href={`/dashboard/teacher/${params.courseId}/quizzes`}>Quizzes</Tab>
          <Tab href={`/dashboard/teacher/${params.courseId}/analytics`}>Analytics</Tab>
        </TabList>
      </Tabs>
      <h1 className="text-xl font-semibold">Course announcements</h1>
      {rows.length === 0 && (
        <div className="text-sm text-gray-600">No announcements yet.</div>
      )}
      <div className="text-gray-600">Course: <span className="font-mono" data-testid="ann-course-id">{params.courseId}</span></div>

      <form action={createAction} className="space-y-2 border rounded p-3" data-testid="ann-create-form">
        <input name="title" placeholder="Title" className="border rounded p-2 w-full" data-testid="ann-input-title" />
        <textarea name="body" placeholder="Body" className="border rounded p-2 w-full" rows={4} data-testid="ann-input-body" />
        <div className="text-sm text-gray-600">
          <label className="block mb-1">Publish at (optional)</label>
          <input type="datetime-local" name="publish_at" className="border rounded p-2" />
        </div>
        <div className="text-sm text-gray-600">
          <label className="block mb-1">Attachment (optional)</label>
          <input type="file" name="file" className="block" />
        </div>
        <button className="bg-black text-white rounded px-3 py-1" type="submit" data-testid="ann-save">Add</button>
      </form>

      <section className="border rounded p-3">
        {rows.length === 0 ? (
          <div className="text-gray-600">No announcements yet.</div>
        ) : (
          <ul className="space-y-2" data-testid="ann-list">
            {rows.map(a => (
              <li key={a.id} className="border rounded p-3" data-testid="ann-row">
                <div className="font-medium" data-testid="ann-title">{a.title}</div>
                <div className="text-sm text-gray-700" data-testid="ann-body">{a.body}</div>
                {(a as any).file_key ? (
                  <div className="flex items-center gap-3">
                    <AnnouncementAttachment keyName={(a as any).file_key as any} />
                    <form action={`/api/files/attachment?key=${encodeURIComponent(String((a as any).file_key))}`} method="post">
                      <input type="hidden" name="_method" value="DELETE" />
                      <button className="underline text-xs" type="submit">Delete</button>
                    </form>
                  </div>
                ) : null}
                <form action={deleteAction} className="mt-2">
                  <input type="hidden" name="id" value={a.id} />
                  <button className="border rounded px-2 py-1" data-testid="ann-delete-btn">Delete</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <a className="underline" href={`/dashboard/teacher/${params.courseId}`}>Back to course</a>
    </section>
  );
}

export const dynamic = "force-dynamic";


