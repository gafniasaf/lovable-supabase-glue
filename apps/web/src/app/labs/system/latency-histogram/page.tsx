import { headers } from "next/headers";
import { serverFetch } from "@/lib/serverFetch";
import { createHealthGateway } from "@/lib/data";

function bucketOf(ms: number): "0-49" | "50-99" | "100-199" | "200-499" | "500plus" {
  if (ms < 50) return "0-49";
  if (ms < 100) return "50-99";
  if (ms < 200) return "100-199";
  if (ms < 500) return "200-499";
  return "500plus";
}

export default async function LatencyHistogramPage() {
  const h = headers();
  const cookie = h.get("cookie") || undefined;
  const testAuth = h.get("x-test-auth") || undefined;
  const extraHeaders = {
    ...(cookie ? { cookie } : {}),
    ...(testAuth ? { "x-test-auth": testAuth } : {}),
  } as HeadersInit;

  const durations: number[] = [];
  for (let i = 0; i < 100; i++) {
    const start = Date.now();
    try { await createHealthGateway().get(); } catch {}
    durations.push(Date.now() - start);
  }

  const bins = { "0-49": 0, "50-99": 0, "100-199": 0, "200-499": 0, "500plus": 0 } as Record<string, number>;
  for (const d of durations) {
    bins[bucketOf(d)] += 1;
  }
  const total = Object.values(bins).reduce((a, b) => a + b, 0);

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Latency histogram</h1>
      <section className="border rounded p-4 inline-block min-w-[260px]">
        <div className="grid grid-cols-2 gap-2">
          <div className="text-gray-500">Samples</div>
          <div className="font-mono" data-testid="hist-sample-count">{String(durations.length)}</div>

          <div className="text-gray-500">0–49 ms</div>
          <div className="font-mono" data-testid="hist-bin-0-49">{String(bins["0-49"])}</div>

          <div className="text-gray-500">50–99 ms</div>
          <div className="font-mono" data-testid="hist-bin-50-99">{String(bins["50-99"])}</div>

          <div className="text-gray-500">100–199 ms</div>
          <div className="font-mono" data-testid="hist-bin-100-199">{String(bins["100-199"])}</div>

          <div className="text-gray-500">200–499 ms</div>
          <div className="font-mono" data-testid="hist-bin-200-499">{String(bins["200-499"])}</div>

          <div className="text-gray-500">500+ ms</div>
          <div className="font-mono" data-testid="hist-bin-500plus">{String(bins["500plus"])}</div>

          <div className="text-gray-500">Bin total</div>
          <div className="font-mono" data-testid="hist-bin-total">{String(total)}</div>
        </div>
      </section>

      <section className="border rounded p-4">
        <h2 className="font-medium mb-2">Durations (ms)</h2>
        <ul className="grid grid-cols-10 gap-2">
          {durations.map((d, i) => (
            <li key={i} className="font-mono text-xs" data-testid="hist-item">{d}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}


