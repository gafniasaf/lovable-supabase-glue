// @ts-nocheck
import { headers, cookies } from "next/headers";
import { serverFetch } from "@/lib/serverFetch";
import { revalidatePath } from "next/cache";

export default async function AdminRolesPage() {
  const h = headers();
  const c = cookies();
  const cookieHeader = h.get("cookie") ?? c.getAll().map(x => `${x.name}=${x.value}`).join("; ");
  const testAuth = h.get("x-test-auth") ?? c.get("x-test-auth")?.value;
  const baseHeaders = { ...(cookieHeader ? { cookie: cookieHeader } : {}), ...(testAuth ? { "x-test-auth": testAuth } : {}) } as HeadersInit;

  // In test-mode we don't have a real user directory; provide inputs
  async function updateRole(formData: FormData) {
    "use server";
    const hh = headers(); const cc = cookies();
    const cookie = hh.get("cookie") ?? cc.getAll().map(x => `${x.name}=${x.value}`).join("; ");
    const ta = hh.get("x-test-auth") ?? cc.get("x-test-auth")?.value;
    const userId = String(formData.get('userId') || '').trim();
    const role = String(formData.get('role') || '').trim();
    if (!userId || !role) return;
    await serverFetch('/api/user/role', { method: 'PATCH', headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}), ...(ta ? { 'x-test-auth': ta } : {}) }, body: JSON.stringify({ userId, role }) });
    revalidatePath('/labs/admin/roles');
  }

  return (
    <section className="p-6 space-y-4" aria-label="Admin roles (labs)">
      <h1 className="text-xl font-semibold">Admin: update user role (labs)</h1>
      <section className="border rounded p-3">
        <form action={updateRole} className="flex flex-wrap items-center gap-2">
          <input name="userId" placeholder="User ID (uuid)" className="border rounded p-2 w-80" />
          <select name="role" className="border rounded p-2">
            <option value="teacher">teacher</option>
            <option value="student">student</option>
            <option value="parent">parent</option>
            <option value="admin">admin</option>
          </select>
          <button className="bg-black text-white rounded px-3 py-1">Update</button>
        </form>
        <p className="text-xs text-gray-600 mt-2">Note: in test-mode, user IDs are synthetic (e.g., test-student-id, test-teacher-id).</p>
      </section>
    </section>
  );
}


