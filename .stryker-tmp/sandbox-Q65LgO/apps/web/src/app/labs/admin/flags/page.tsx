// @ts-nocheck
import { headers, cookies } from "next/headers";
import { serverFetch } from "@/lib/serverFetch";
import { revalidatePath } from "next/cache";

export default async function FlagsPage() {
  const h = headers();
  const c = cookies();
  const cookieHeader = h.get("cookie") ?? c.getAll().map(x => `${x.name}=${x.value}`).join("; ");
  const testAuth = h.get("x-test-auth") ?? c.get("x-test-auth")?.value;
  const baseHeaders = { ...(cookieHeader ? { cookie: cookieHeader } : {}), ...(testAuth ? { "x-test-auth": testAuth } : {}) } as HeadersInit;

  const res = await serverFetch('/api/flags', { cache: 'no-store', headers: baseHeaders });
  const flags = res.ok ? await res.json() : {} as Record<string, boolean>;

  async function toggle(formData: FormData) {
    "use server";
    const hh = headers(); const cc = cookies();
    const cookie = hh.get("cookie") ?? cc.getAll().map(x => `${x.name}=${x.value}`).join("; ");
    const ta = hh.get("x-test-auth") ?? cc.get("x-test-auth")?.value;
    const key = String(formData.get('key') || '').trim();
    const value = String(formData.get('value') || 'false') === 'true';
    await serverFetch('/api/flags', { method: 'PATCH', headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}), ...(ta ? { 'x-test-auth': ta } : {}) }, body: JSON.stringify({ key, value }) });
    revalidatePath('/labs/admin/flags');
  }

  const entries = Object.entries(flags);
  return (
    <section className="p-6 space-y-4" aria-label="Feature flags (labs)">
      <h1 className="text-xl font-semibold">Feature flags (labs)</h1>
      {entries.length === 0 ? (
        <div className="text-gray-600">No flags yet.</div>
      ) : (
        <ul className="space-y-2">
          {entries.map(([k,v]) => (
            <li key={k} className="border rounded p-3 flex items-center justify-between">
              <div><span className="font-mono">{k}</span></div>
              <form action={toggle} className="flex items-center gap-2">
                <input type="hidden" name="key" value={k} />
                <input type="hidden" name="value" value={(!v).toString()} />
                <span className="text-sm">{v ? 'on' : 'off'}</span>
                <button className="border rounded px-2 py-1">Toggle</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}


