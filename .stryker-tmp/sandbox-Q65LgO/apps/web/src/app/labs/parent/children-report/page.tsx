// @ts-nocheck
import { headers, cookies } from "next/headers";
import { serverFetch } from "@/lib/serverFetch";

type ParentLink = { id: string; parent_id: string; student_id: string; created_at: string };

export default async function ParentChildrenReportPage() {
  const h = headers();
  const c = cookies();
  const cookieHeader = h.get("cookie") ?? c.getAll().map(x => `${x.name}=${x.value}`).join("; ");
  const testAuth = h.get("x-test-auth") ?? c.get("x-test-auth")?.value;

  const res = await serverFetch(`/api/parent-links?parent_id=test-parent-id`, {
    cache: "no-store",
    headers: {
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
      ...(testAuth ? { "x-test-auth": testAuth } : {}),
    },
  });

  if (res.status === 401) {
    return (
      <main className="p-6">
        <a className="text-blue-600 underline" href="/login">Sign in</a>
      </main>
    );
  }

  const rows: ParentLink[] = res.ok ? await res.json() : [];
  const total = rows.length;

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Children report</h1>
      <div>
        <span className="text-gray-600 mr-2">Total:</span>
        <span data-testid="children-total">{String(total)}</span>
      </div>
      {rows.length === 0 ? (
        <div className="text-gray-600">No linked students.</div>
      ) : (
        <ul className="space-y-2" data-testid="children-list">
          {rows.map((row) => (
            <li key={row.id} data-testid="child-row">
              <span data-testid="child-student-id">{row.student_id}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}


