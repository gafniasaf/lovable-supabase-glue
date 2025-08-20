// @ts-nocheck
import { headers, cookies } from "next/headers";
import { serverFetch } from "@/lib/serverFetch";

type Event = { id: string; user_id: string | null; event_type: string; entity_type: string; entity_id: string; ts: string; meta: any };

export default async function EventsPage() {
  const h = headers();
  const c = cookies();
  const cookieHeader = h.get("cookie") ?? c.getAll().map(x => `${x.name}=${x.value}`).join("; ");
  const testAuth = h.get("x-test-auth") ?? c.get("x-test-auth")?.value;
  const baseHeaders = { ...(cookieHeader ? { cookie: cookieHeader } : {}), ...(testAuth ? { "x-test-auth": testAuth } : {}) } as HeadersInit;

  const res = await serverFetch('/api/events', { cache: 'no-store', headers: baseHeaders });
  const list: Event[] = res.ok ? await res.json() : [];

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Events (labs)</h1>
      {list.length === 0 ? (
        <div className="text-gray-600">No events</div>
      ) : (
        <ul className="space-y-2">
          {list.map(e => (
            <li key={e.id} className="border rounded p-3 text-sm">
              <div className="text-xs text-gray-600">{new Date(e.ts).toLocaleString()}</div>
              <div className="font-mono">{e.event_type} — {e.entity_type}:{e.entity_id}</div>
              <pre className="bg-gray-50 p-2 rounded overflow-auto text-xs">{JSON.stringify(e.meta || {}, null, 2)}</pre>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}


