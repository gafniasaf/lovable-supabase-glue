// @ts-nocheck
import { headers, cookies } from "next/headers";
import { serverFetch } from "@/lib/serverFetch";
import Trans from "@/lib/i18n/Trans";
import { revalidatePath } from "next/cache";

type Course = { id: string; title: string };
type Announcement = { id: string; course_id: string; title: string; body: string; created_at: string };

export default async function TeacherAnnouncementsPage({ searchParams }: { searchParams?: { course_id?: string } }) {
  const h = headers();
  const c = cookies();
  const cookieHeader = h.get("cookie") ?? c.getAll().map(x => `${x.name}=${x.value}`).join("; ");
  const testAuth = h.get("x-test-auth") ?? c.get("x-test-auth")?.value;

  const baseHeaders = { ...(cookieHeader ? { cookie: cookieHeader } : {}), ...(testAuth ? { "x-test-auth": testAuth } : {}) } as HeadersInit;

  const coursesRes = await serverFetch('/api/courses', { cache: 'no-store', headers: baseHeaders });
  if (coursesRes.status === 401) {
    return (
      <section className="p-6" aria-label="Teacher announcements"><p className="text-gray-700"><Trans keyPath="auth.notSignedIn" fallback="You are not signed in." /> <a className="underline" href="/login"><Trans keyPath="auth.signin" fallback="Sign in" /></a></p></section>
    );
  }
  const courses: Course[] = coursesRes.ok ? await coursesRes.json() : [];

  const selectedCourseId = (searchParams?.course_id ?? '').trim() || (courses[0]?.id ?? '');
  let ann: Announcement[] = [];
  if (selectedCourseId) {
    const aRes = await serverFetch(`/api/announcements?course_id=${encodeURIComponent(selectedCourseId)}&include_unpublished=1`, { cache: 'no-store', headers: baseHeaders });
    ann = aRes.ok ? await aRes.json() : [];
  }

  async function createAction(formData: FormData) {
    "use server";
    const hh = headers();
    const cc = cookies();
    const cookie = hh.get("cookie") ?? cc.getAll().map(x => `${x.name}=${x.value}`).join("; ");
    const ta = hh.get("x-test-auth") ?? cc.get("x-test-auth")?.value;
    const title = String(formData.get('title') || '').trim();
    const body = String(formData.get('body') || '').trim();
    const publishRaw = String(formData.get('publish_at') || '').trim();
    const publish_at = publishRaw ? new Date(publishRaw).toISOString() : null;
    await serverFetch('/api/announcements', { method: 'POST', headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}), ...(ta ? { 'x-test-auth': ta } : {}) }, body: JSON.stringify({ course_id: selectedCourseId, title, body, publish_at }) });
    revalidatePath('/labs/teacher/announcements');
  }

  return (
    <section className="p-6 space-y-4" aria-label="Teacher announcements">
      <h1 className="text-xl font-semibold">Teacher announcements</h1>
      <div className="flex gap-2 items-center">
        <span className="text-gray-600">Courses:</span>
        <span className="font-mono" data-testid="ann-course-count">{courses.length}</span>
      </div>
      {selectedCourseId ? (
        <section className="border rounded p-4">
          <div className="mb-2">
            <span className="text-gray-600 mr-2">Course</span>
            <span className="font-mono" data-testid="ann-course-id">{selectedCourseId}</span>
          </div>
          <form action={createAction} className="mb-3 flex flex-wrap gap-2 items-center">
            <input name="title" placeholder="Title" className="border rounded p-2" />
            <input name="publish_at" type="datetime-local" className="border rounded p-2" />
            <input name="body" placeholder="Body" className="border rounded p-2 w-64" />
            <button className="bg-black text-white rounded px-3 py-1">Add</button>
          </form>
          {ann.length === 0 ? (
            <div className="text-gray-600">No announcements yet.</div>
          ) : (
            <ul className="space-y-2" data-testid="ann-list">
              {ann.map(a => (
                <li key={a.id} className="border rounded p-3">
                  <div className="font-medium" data-testid="ann-title">{a.title}</div>
                  <div className="text-sm text-gray-700" data-testid="ann-body">{a.body}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <div className="text-gray-600">No courses yet.</div>
      )}
    </section>
  );
}


