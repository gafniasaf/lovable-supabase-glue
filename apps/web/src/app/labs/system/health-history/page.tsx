import { headers } from "next/headers";
import { serverFetch } from "@/lib/serverFetch";
import { createHealthGateway } from "@/lib/data";

type Health = { ok: boolean; ts: number; testMode: boolean; testRole: string | null };

async function takeSamples(count: number, extraHeaders: HeadersInit) {
  const samples: { ts: number; at: number }[] = [];
  for (let i = 0; i < count; i++) {
    const at = Date.now();
    const data = (await createHealthGateway().get()) as Health;
    samples.push({ ts: data.ts, at });
  }
  return samples;
}

function computeDeltasMs(points: number[]): { min: number; avg: number; max: number } {
  if (points.length <= 1) return { min: 0, avg: 0, max: 0 };
  const deltas: number[] = [];
  for (let i = 1; i < points.length; i++) {
    deltas.push(points[i] - points[i - 1]);
  }
  const min = Math.min(...deltas);
  const max = Math.max(...deltas);
  const avg = Math.round(deltas.reduce((a, b) => a + b, 0) / deltas.length);
  return { min, avg, max };
}

export default async function HealthHistoryPage() {
  const h = headers();
  const cookie = h.get("cookie") || undefined;
  const testAuth = h.get("x-test-auth") || undefined;

  const samples = await takeSamples(10, {
    ...(cookie ? { cookie } : {}),
    ...(testAuth ? { "x-test-auth": testAuth } : {}),
  });

  // Use local capture times for inter-sample deltas
  const times = samples.map(s => s.at);
  const deltas = computeDeltasMs(times);

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">System health history</h1>
      <section className="border rounded p-4 inline-block min-w-[260px]">
        <div className="grid grid-cols-2 gap-2">
          <div className="text-gray-500">Samples</div>
          <div className="font-mono" data-testid="history-sample-count">{String(samples.length)}</div>

          <div className="text-gray-500">Min Δ (ms)</div>
          <div className="font-mono" data-testid="history-min-delta">{String(deltas.min)}</div>

          <div className="text-gray-500">Avg Δ (ms)</div>
          <div className="font-mono" data-testid="history-avg-delta">{String(deltas.avg)}</div>

          <div className="text-gray-500">Max Δ (ms)</div>
          <div className="font-mono" data-testid="history-max-delta">{String(deltas.max)}</div>
        </div>
      </section>

      <section className="border rounded p-4">
        <h2 className="font-medium mb-2">Timestamps</h2>
        <ul className="space-y-1">
          {samples.map((s, idx) => (
            <li key={idx} className="font-mono text-sm" data-testid="history-item">{new Date(s.ts).toISOString()}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}


