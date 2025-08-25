import { submissionCreateRequest } from "@education/shared";
import { redirect } from "next/navigation";
import { createAssignmentsGateway } from "@/lib/data/assignments";
import { createFilesGateway } from "@/lib/data/files";
import { uploadBinaryToUrl } from "@/lib/files";
import { createSubmissionsGateway } from "@/lib/data/submissions";

export type Params = { courseId: string; assignmentId: string };

export default async function StudentSubmitAssignmentPage({ params, searchParams }: { params: Params; searchParams?: { [k: string]: string | string[] | undefined } }) {
  const list = await createAssignmentsGateway().listByCourse(params.courseId).catch(() => [] as any[]);
  const assignment = (list as any[]).find(a => a.id === params.assignmentId);
  // Load my submissions for this assignment to show latest status/feedback
  const mySubs = await createSubmissionsGateway().listByAssignment(params.assignmentId).catch(() => [] as any[]);
  const latest = Array.isArray(mySubs) && mySubs.length > 0 ? mySubs[0] : null;

  // Optional: lookup external target details when flag enabled
  let target: any | null = null;
  if (process.env.EXTERNAL_COURSES === '1' || process.env.NEXT_PUBLIC_EXTERNAL_COURSES === '1') {
    try {
      // Minimal: cannot resolve per-assignment without additional API; show generic launch if course has launch_url (handled elsewhere)
      target = null;
    } catch {}
  }

  async function submitAction(formData: FormData) {
    "use server";
    const text = String(formData.get("text") || "");
    const files = (formData.getAll("file") as unknown as File[] | null) || [] as any;
    const file_urls: string[] = [];
    try {
      for (const f of (files as any[])) {
        if (!f || typeof (f as any).arrayBuffer !== 'function') continue;
        const ct = (f as any).type || 'application/octet-stream';
        const up = await createFilesGateway().getUploadUrl({ owner_type: 'submission', owner_id: params.assignmentId, content_type: ct, filename: (f as any).name || undefined });
        const ab = await (f as any).arrayBuffer();
        await uploadBinaryToUrl(up.url, ab, { method: up.method, headers: up.headers as any });
        if ((up as any).key) file_urls.push(String((up as any).key));
      }
    } catch {}
    const payload = submissionCreateRequest.parse({ assignment_id: params.assignmentId, text, ...(file_urls.length ? { file_urls } : {}) });
    await createSubmissionsGateway().create(payload);
    redirect(`/dashboard/student/${params.courseId}/assignments/${params.assignmentId}/submit?ok=1`);
  }

  return (
    <section className="p-6 space-y-4" aria-label="Submit assignment">
      <h1 className="text-xl font-semibold">Submit Assignment</h1>
      <div className="text-gray-700">
        <div className="font-medium" data-testid="assignment-title">{assignment?.title ?? "Assignment"}</div>
        <div className="text-sm text-gray-500">{assignment?.description ?? null}</div>
      </div>

      {latest ? (
        <section className="border rounded p-3 space-y-1" aria-label="Latest submission" data-testid="latest-submission">
          <div className="text-sm text-gray-600">Latest submission</div>
          <div className="text-sm">Submitted at: <span className="font-mono">{new Date(latest.submitted_at).toLocaleString()}</span></div>
          <div className="text-sm">Score: <span className="font-mono">{latest.score ?? '—'}</span></div>
          <div className="text-sm">Feedback: <span className="font-mono">{latest.feedback ?? '—'}</span></div>
        </section>
      ) : null}

      {searchParams?.ok === "1" && (
        <div className="text-green-700" data-testid="submit-ok">Submitted!</div>
      )}

      {target?.source === 'v2' && target?.launch_url ? (
        <section className="border rounded p-3 space-y-2">
          <div className="font-medium">Launch Activity</div>
          <a className="underline text-sm" href={`/dashboard/student/${params.courseId}`}>Open embedded activity</a>
          <div className="text-xs text-gray-600">Your progress is saved automatically while you work.</div>
        </section>
      ) : null}

      <form id="submit-form" action={submitAction} className="space-y-3 pb-20" data-testid="submit-form">
        <div>
          <label className="block text-sm" htmlFor="submit-text">Your answer</label>
          <textarea id="submit-text" name="text" className="border rounded w-full p-2" rows={6} required minLength={1} data-testid="submit-text" />
        </div>
        <div>
          <label className="block text-sm" htmlFor="submit-file-input">Attachments (optional)</label>
          <input id="submit-file-input" type="file" name="file" className="block" multiple data-testid="submit-file-input" />
        </div>
        <button className="bg-black text-white rounded px-4 py-2" type="submit" data-testid="submit-btn">Submit</button>
      </form>

      <a className="underline" href={`/dashboard/student/${params.courseId}/assignments`}>Back to assignments</a>
      <div className="fixed left-0 right-0 bottom-0 bg-white/90 border-t p-3 flex items-center justify-end gap-3 md:hidden">
        <button className="bg-black text-white rounded px-4 py-2" type="submit" form="submit-form" formAction={submitAction}>{'Submit'}</button>
      </div>
    </section>
  );
}


