// @ts-nocheck
import { headers, cookies } from "next/headers";
import { serverFetch } from "@/lib/serverFetch";
import Trans from "@/lib/i18n/Trans";

export default async function StudentEnrollmentsGridPage() {
  const h = headers();
  const cookieHeader = h.get("cookie") ?? "";
  const testAuth = h.get("x-test-auth") ?? cookies().get("x-test-auth")?.value;

  const res = await serverFetch(`/api/enrollments`, {
    cache: "no-store",
    headers: {
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
      ...(testAuth ? { "x-test-auth": testAuth } : {}),
    },
  });

  if (res.status === 401) {
    return (
      <main className="p-6">
        <p className="text-gray-700">
          <Trans keyPath="auth.notSignedIn" fallback="You are not signed in." /> {" "}
          <a className="underline" href="/login"><Trans keyPath="auth.signin" fallback="Sign in" /></a>
        </p>
      </main>
    );
  }

  const rows: Array<{ id: string; course_id: string }> = res.ok ? await res.json() : [];

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold mb-4">Your enrollments</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="enrollments-grid">
        {(rows ?? []).map((e) => (
          <a
            key={e.id}
            href={`/dashboard/teacher/${e.course_id}`}
            className="border rounded p-3 hover:bg-gray-50"
            data-testid="enrollment-card"
          >
            <div className="text-sm text-gray-600">Course ID</div>
            <div className="font-mono" data-testid="enrollment-course-id">{e.course_id}</div>
          </a>
        ))}
        {(!rows || rows.length === 0) && (
          <div className="text-gray-500">No enrollments yet.</div>
        )}
      </div>
    </main>
  );
}


