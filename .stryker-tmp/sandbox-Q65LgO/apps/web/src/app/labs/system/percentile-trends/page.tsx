// @ts-nocheck
import { headers } from "next/headers";
import { serverFetch } from "@/lib/serverFetch";

function percentileNearestRank(sortedAsc: number[], p: number): number {
  if (sortedAsc.length === 0) return 0;
  const n = sortedAsc.length;
  const rank = Math.ceil((p / 100) * n);
  const idx = Math.min(Math.max(rank, 1), n) - 1;
  return sortedAsc[idx];
}

async function sampleWindow(size: number, extraHeaders: HeadersInit): Promise<number[]> {
  const tasks = Array.from({ length: size }, async () => {
    const start = Date.now();
    const res = await serverFetch("/api/health", { headers: extraHeaders, cache: "no-store" });
    await res.text();
    return Date.now() - start;
  });
  return Promise.all(tasks);
}

export default async function PercentileTrendsPage() {
  const h = headers();
  const cookie = h.get("cookie") || undefined;
  const testAuth = h.get("x-test-auth") || undefined;
  const extraHeaders = { ...(cookie ? { cookie } : {}), ...(testAuth ? { "x-test-auth": testAuth } : {}) } as HeadersInit;

  const windows = 5;
  const windowSize = 5;
  const results: { index: number; durations: number[]; p50: number }[] = [];
  for (let i = 0; i < windows; i++) {
    const durations = await sampleWindow(windowSize, extraHeaders);
    const p50 = percentileNearestRank([...durations].sort((a, b) => a - b), 50);
    results.push({ index: i + 1, durations, p50 });
  }
  const overallCount = results.reduce((sum, r) => sum + r.durations.length, 0);

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Percentile trends</h1>
      <div className="flex gap-6 items-center">
        <div>Windows: <span className="font-mono" data-testid="trends-window-count">{String(windows)}</span></div>
        <div>Overall samples: <span className="font-mono" data-testid="trends-overall-sample-count">{String(overallCount)}</span></div>
      </div>
      <section className="space-y-4">
        {results.map(r => (
          <div key={r.index} className="border rounded p-4" data-testid="trends-window-row">
            <div className="flex gap-6 items-center mb-3">
              <div>Window <span className="font-mono" data-testid="trends-window-index">{r.index}</span></div>
              <div>p50 (ms): <span className="font-mono" data-testid="trends-window-p50">{String(r.p50)}</span></div>
            </div>
            <ul className="grid grid-cols-5 gap-2">
              {r.durations.map((d, i) => (
                <li key={i} className="font-mono text-xs" data-testid="trends-item">{d}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </main>
  );
}


