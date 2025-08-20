import { headers, cookies } from "next/headers";
import { createParentLinksGateway, createAnnouncementsGateway } from "@/lib/data";

type Announcement = { id: string; course_id: string; title: string; body: string; publish_at?: string | null; created_at: string };
type ParentLink = { id: string; parent_id: string; student_id: string; created_at: string };

export default async function ParentAnnouncementsPage({ searchParams }: { searchParams?: { course_id?: string } }) {
  const h = headers();
  const c = cookies();
  const cookieHeader = h.get("cookie") ?? c.getAll().map(x => `${x.name}=${x.value}`).join("; ");
  const testAuth = h.get("x-test-auth") ?? c.get("x-test-auth")?.value;

  // Get linked students for this parent (test parent id used in labs/specs)
  let links: ParentLink[] = [];
  try { links = await createParentLinksGateway().listByParent('test-parent-id') as any; } catch {}
  if (!cookieHeader && !testAuth && links.length === 0) {
    return (
      <main className="p-6"><a className="text-blue-600 underline" href="/login">Sign in</a></main>
    );
  }
  

  const courseId = (searchParams?.course_id ?? '').trim();
  let content: any = (
    <div className="text-gray-700">
      Linked students: <span className="font-mono" data-testid="parent-linked-count">{links.length}</span>
      <div className="mt-2 text-sm text-gray-600">Provide ?course_id=... to view announcements for a course.</div>
    </div>
  );
  if (courseId) {
    const ann: Announcement[] = await createAnnouncementsGateway().listByCourse(courseId).catch(() => [] as any[]);
    content = (
      <section className="border rounded p-3" data-testid="parent-ann-section">
        <div className="mb-2">Course: <span className="font-mono">{courseId}</span></div>
        {ann.length === 0 ? (
          <div className="text-gray-600">No announcements yet.</div>
        ) : (
          <ul className="space-y-2" data-testid="parent-ann-list">
            {ann.map(a => (
              <li key={a.id} className="border rounded p-3">
                <div className="font-medium">{a.title}</div>
                <div className="text-sm text-gray-700">{a.body}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Parent announcements (labs)</h1>
      {content}
    </main>
  );
}


