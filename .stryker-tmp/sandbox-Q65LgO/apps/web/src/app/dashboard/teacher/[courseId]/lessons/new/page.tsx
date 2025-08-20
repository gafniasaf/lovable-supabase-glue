// @ts-nocheck
import { getServerComponentSupabase, getCurrentUser } from "@/lib/supabaseServer";
import Link from "next/link";
import Trans from "@/lib/i18n/Trans";
import { createFilesGateway } from "@/lib/data/files";
import { createLessonsGateway } from "@/lib/data/lessons";
import { uploadBinaryToUrl } from "@/lib/files";

export default async function NewLessonPage({ params }: { params: { courseId: string } }) {
  const supabase = getServerComponentSupabase();
  const user = await getCurrentUser();
  if (!user) return (
    <section className="p-6" aria-label="New lesson">
      <span><Trans keyPath="auth.notSignedIn" fallback="You are not signed in." /> <a className="underline" href="/login"><Trans keyPath="auth.signin" fallback="Sign in" /></a></span>
    </section>
  );

  const courseId = params.courseId;
  async function createLesson(formData: FormData) {
    "use server";
    const title = String(formData.get("title") || "");
    const content = String(formData.get("content") || "");
    const order_index = Number(formData.get("order_index") || 1);
    let file_key: string | undefined = undefined;
    try {
      const f = formData.get('file') as unknown as File | null;
      if (f && typeof (f as any).arrayBuffer === 'function') {
        const ct = (f as any).type || 'application/octet-stream';
        const up = await createFilesGateway().getUploadUrl({ owner_type: 'lesson', owner_id: courseId, content_type: ct, filename: (f as any).name || undefined });
        const ab = await (f as any).arrayBuffer();
        await uploadBinaryToUrl(up.url, ab, { method: up.method, headers: up.headers as any });
        if ((up as any).key) file_key = String((up as any).key);
      }
    } catch {}
    await createLessonsGateway().create({ course_id: courseId, title, content, order_index, ...(file_key ? { file_key } : {}) } as any);
  }

  return (
    <section className="p-6 space-y-4" aria-label="New lesson">
      <h1 className="text-xl font-semibold">New lesson</h1>
      <form action={createLesson} className="space-y-3">
        <div>
          <label className="block text-sm">Title</label>
          <input name="title" className="border rounded w-full p-2" required minLength={3} maxLength={200} />
        </div>
        <div>
          <label className="block text-sm">Content</label>
          <textarea name="content" className="border rounded w-full p-2" rows={6} />
        </div>
        <div>
          <label className="block text-sm">Order</label>
          <input name="order_index" type="number" min={1} defaultValue={1} className="border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm">Attachment (optional)</label>
          <input type="file" name="file" className="block" />
        </div>
        <button className="bg-black text-white px-3 py-2 rounded" type="submit">Create</button>
      </form>
      <Link className="underline" href={`/dashboard/teacher/${courseId}`}>Back</Link>
    </section>
  );
}


