// @ts-nocheck
import { headers, cookies } from "next/headers";
import { serverFetch } from "@/lib/serverFetch";

export default async function EngagementPage({ searchParams }: { searchParams?: { course_id?: string } }) {
  const h = headers();
  const c = cookies();
  const cookieHeader = h.get("cookie") ?? c.getAll().map(x => `${x.name}=${x.value}`).join("; ");
  const testAuth = h.get("x-test-auth") ?? c.get("x-test-auth")?.value;
  const baseHeaders = { ...(cookieHeader ? { cookie: cookieHeader } : {}), ...(testAuth ? { "x-test-auth": testAuth } : {}) } as HeadersInit;

  const courseId = (searchParams?.course_id ?? '').trim();
  if (!courseId) return <section className="p-6" aria-label="Course engagement (labs)">Provide ?course_id=...</section>;

  const res = await serverFetch(`/api/reports/engagement?course_id=${encodeURIComponent(courseId)}`, { cache: 'no-store', headers: baseHeaders });
  const data = res.ok ? await res.json() : { lessons: 0, assignments: 0, submissions: 0 } as any;

  return (
    <section className="p-6 space-y-4" aria-label="Course engagement (labs)">
      <h1 className="text-xl font-semibold">Course engagement (labs)</h1>
      <div>Course: <span className="font-mono">{courseId}</span></div>
      <ul className="list-disc ml-5">
        <li>Lessons: {data.lessons}</li>
        <li>Assignments: {data.assignments}</li>
        <li>Submissions: {data.submissions}</li>
      </ul>
      <p className="text-sm text-gray-600">Note: This is a simple snapshot using available endpoints; full analytics service can expand this.</p>
    </section>
  );
}


