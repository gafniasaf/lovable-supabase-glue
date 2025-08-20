import { headers } from "next/headers";
import { serverFetch } from "@/lib/serverFetch";
import { createHealthGateway } from "@/lib/data";

type HealthResponse = {
  ok: boolean;
  ts: number;
  testRole: string | null;
  testMode: boolean;
};

function humanizeSince(timestampMs: number): string {
  const diff = Math.max(0, Date.now() - timestampMs);
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default async function UptimeTilePage() {
  const incoming = headers();
  const cookie = incoming.get("cookie") || undefined;
  const testAuth = incoming.get("x-test-auth") || undefined;

  let data: HealthResponse | null = null;
  try {
    data = (await createHealthGateway().get()) as any as HealthResponse;
  } catch {
    data = null;
  }

  const tsIso = data ? new Date(data.ts).toISOString() : "";
  const tsHuman = data ? humanizeSince(data.ts) : "";

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">System uptime</h1>
      {data && (
        <section className="mt-4 inline-block rounded border p-4 bg-white shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="text-gray-500">ok</div>
            <div className="font-mono" data-testid="uptime-ok">{String(data.ok)}</div>

            <div className="text-gray-500">ts (ISO)</div>
            <div className="font-mono" data-testid="uptime-ts-iso">{tsIso}</div>

            <div className="text-gray-500">ts (human)</div>
            <div className="font-mono" data-testid="uptime-ts-human">{tsHuman}</div>

            <div className="text-gray-500">testRole</div>
            <div className="font-mono" data-testid="uptime-test-role">{String(data.testRole)}</div>

            <div className="text-gray-500">testMode</div>
            <div className="font-mono" data-testid="uptime-test-mode">{String(data.testMode)}</div>
          </div>
        </section>
      )}
      {!data && (
        <p className="text-gray-700">Unable to load uptime.</p>
      )}
    </main>
  );
}


