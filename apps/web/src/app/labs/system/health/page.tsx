import { headers } from "next/headers";
import { createHealthGateway } from "@/lib/data";

type HealthResponse = {
  ok: boolean;
  ts: number;
  testRole: string | null;
  testMode: boolean;
};

function formatTimeAgo(timestampMs: number): string {
  const diffMs = Math.max(0, Date.now() - timestampMs);
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default async function SystemHealthPage() {
  const incomingHeaders = headers();
  const cookieHeader = incomingHeaders.get("cookie") || undefined;
  const testAuthHeader = incomingHeaders.get("x-test-auth") || undefined;

  let data: HealthResponse | null = null;
  try { data = await createHealthGateway().get() as any; } catch {}

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">System health</h1>
      {!data && (
        <p className="text-gray-700">Unable to load health data.</p>
      )}
      {data && (
        <section
          className="rounded border p-4 bg-white shadow-sm max-w-md"
          data-testid="system-health-panel"
        >
          <dl className="grid grid-cols-2 gap-2">
            <dt className="text-gray-500">ok</dt>
            <dd className="font-mono" data-testid="status-ok">{String(data.ok)}</dd>

            <dt className="text-gray-500">ts</dt>
            <dd className="font-mono" data-testid="status-ts-human">{formatTimeAgo(data.ts)}</dd>

            <dt className="text-gray-500">testRole</dt>
            <dd className="font-mono" data-testid="status-test-role">{String(data.testRole)}</dd>

            <dt className="text-gray-500">testMode</dt>
            <dd className="font-mono" data-testid="status-test-mode">{String(data.testMode)}</dd>
          </dl>
        </section>
      )}
    </main>
  );
}


