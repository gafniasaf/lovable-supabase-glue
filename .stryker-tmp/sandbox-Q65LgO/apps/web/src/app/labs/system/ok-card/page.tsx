// @ts-nocheck
import { cookies, headers } from "next/headers";
import { serverFetch } from "@/lib/serverFetch";

type Health = { ok: boolean; ts: number; testRole: string | null; testMode: boolean };

function humanizeSince(ts: number): string {
  const deltaMs = Math.max(0, Date.now() - ts);
  const seconds = Math.floor(deltaMs / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default async function SystemOkCardPage() {
  const cookieStore = cookies();
  const incomingHeaders = headers();

  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const xTestAuth = incomingHeaders.get("x-test-auth") ?? cookieStore.get("x-test-auth")?.value;

  const res = await serverFetch("/api/health", {
    headers: {
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
      ...(xTestAuth ? { "x-test-auth": xTestAuth } : {})
    }
  });

  const data: Health = res.ok ? await res.json() : { ok: false, ts: Date.now(), testRole: null, testMode: false };
  const tsHuman = humanizeSince(data.ts);

  return (
    <main className="p-6">
      <div className="border rounded p-4 inline-block">
        <div className="text-lg font-medium mb-2">System OK (read-only)</div>
        <div className="space-y-1">
          <div>
            <span className="text-gray-600 mr-2">ok:</span>
            <span data-testid="ok-value">{String(data.ok)}</span>
          </div>
          <div>
            <span className="text-gray-600 mr-2">ts:</span>
            <span data-testid="ts-human">{tsHuman}</span>
          </div>
        </div>
      </div>
    </main>
  );
}


