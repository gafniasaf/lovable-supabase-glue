import { headers } from "next/headers";
import { serverFetch } from "@/lib/serverFetch";
import { createHealthGateway } from "@/lib/data";

async function sampleLatencies(count: number, extraHeaders: HeadersInit): Promise<number[]> {
  const times: number[] = [];
  for (let i = 0; i < count; i++) {
    const start = Date.now();
    try { await createHealthGateway().get(); } catch {}
    times.push(Date.now() - start);
  }
  return times;
}

export default async function LatencySamplerPage() {
  const h = headers();
  const cookie = h.get("cookie") || undefined;
  const testAuth = h.get("x-test-auth") || undefined;

  const samples = await sampleLatencies(5, {
    ...(cookie ? { cookie } : {}),
    ...(testAuth ? { "x-test-auth": testAuth } : {}),
  });

  const min = samples.length ? Math.min(...samples) : 0;
  const max = samples.length ? Math.max(...samples) : 0;
  const avg = samples.length ? Math.round(samples.reduce((a, b) => a + b, 0) / samples.length) : 0;

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Latency sampler</h1>
      <section className="border rounded p-4 inline-block min-w-[240px]">
        <div className="grid grid-cols-2 gap-2">
          <div className="text-gray-500">Min (ms)</div>
          <div className="font-mono" data-testid="latency-min">{String(min)}</div>

          <div className="text-gray-500">Avg (ms)</div>
          <div className="font-mono" data-testid="latency-avg">{String(avg)}</div>

          <div className="text-gray-500">Max (ms)</div>
          <div className="font-mono" data-testid="latency-max">{String(max)}</div>

          <div className="text-gray-500">Samples</div>
          <div className="font-mono" data-testid="latency-sample-count">{String(samples.length)}</div>
        </div>
      </section>
    </main>
  );
}


