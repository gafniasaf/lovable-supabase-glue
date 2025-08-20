// @ts-nocheck
import { headers, cookies } from "next/headers";
import { serverFetch } from "@/lib/serverFetch";

type Assignment = { id: string; title: string };
type Submission = { id: string; assignment_id: string; student_id: string; submitted_at: string; score?: number | null };

export default async function GradingQueuePage({ searchParams }: { searchParams?: { course_id?: string } }) {
  const h = headers();
  const c = cookies();
  const cookieHeader = h.get("cookie") ?? c.getAll().map(x => `${x.name}=${x.value}`).join("; ");
  const testAuth = h.get("x-test-auth") ?? c.get("x-test-auth")?.value;
  const baseHeaders = { ...(cookieHeader ? { cookie: cookieHeader } : {}), ...(testAuth ? { "x-test-auth": testAuth } : {}) } as HeadersInit;

  const courseId = (searchParams?.course_id ?? '').trim();
  const asgRes = courseId ? await serverFetch(`/api/assignments?course_id=${encodeURIComponent(courseId)}`, { cache: 'no-store', headers: baseHeaders }) : null;
  const assignments: Assignment[] = asgRes?.ok ? await asgRes.json() : [];
  const submissions: Submission[] = [];
  for (const a of assignments) {
    const sRes = await serverFetch(`/api/submissions?assignment_id=${encodeURIComponent(a.id)}`, { cache: 'no-store', headers: baseHeaders });
    const rows: Submission[] = sRes.ok ? await sRes.json() : [];
    for (const r of rows) if (r.score == null) submissions.push(r);
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Grading queue (labs)</h1>
      {!courseId ? (
        <div className="text-gray-600">Provide ?course_id=... to view ungraded submissions.</div>
      ) : (
        <section className="border rounded p-3">
          <div className="mb-2">Course: <span className="font-mono">{courseId}</span></div>
          {submissions.length === 0 ? (
            <div className="text-gray-600">No ungraded submissions.</div>
          ) : (
            <ul className="space-y-2">
              {submissions.map(s => (
                <li key={s.id} className="border rounded p-3">
                  <div className="text-sm text-gray-700">Submission <span className="font-mono">{s.id}</span> • Student <span className="font-mono">{s.student_id}</span> • {new Date(s.submitted_at).toLocaleString()}</div>
                  <form action={async (fd: FormData) => {
                    "use server";
                    const hh = headers(); const cc = cookies();
                    const cookie = hh.get("cookie") ?? cc.getAll().map(x => `${x.name}=${x.value}`).join("; ");
                    const ta = hh.get("x-test-auth") ?? cc.get("x-test-auth")?.value;
                    const id = String(fd.get('id') || '');
                    const score = Number(fd.get('score') || '0');
                    await serverFetch(`/api/submissions?id=${encodeURIComponent(id)}`, { method: 'PATCH', headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}), ...(ta ? { 'x-test-auth': ta } : {}) }, body: JSON.stringify({ score }) });
                  }} className="mt-2 flex items-center gap-2">
                    <input type="hidden" name="id" value={s.id} />
                    <input name="score" type="number" min={0} max={100} className="border rounded p-1 w-20" placeholder="Score" />
                    <button className="bg-black text-white rounded px-3 py-1">Grade</button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}


