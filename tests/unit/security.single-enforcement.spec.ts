import { withRouteTiming } from "../../apps/web/src/server/withRouteTiming";
import { createApiHandler } from "../../apps/web/src/server/apiHandler";
import { getCounters } from "../../apps/web/src/lib/metrics";
import { z } from "zod";

function makeReq(url: string, init?: RequestInit) {
  return new Request(url, init as any);
}

describe("Security single-enforcement when composing withRouteTiming(createApiHandler)", () => {
  const origEnv = { ...process.env } as any;

  afterEach(() => {
    process.env = origEnv;
  });

  test("CSRF same-origin check enforced once (403 and single counter increment)", async () => {
    process.env = { ...origEnv, NODE_ENV: "test", NEXT_PUBLIC_BASE_URL: "http://localhost:9999" } as any;

    const handler = createApiHandler({
      schema: z.object({}).optional(),
      async handler() {
        return Response.json({ ok: true }, { status: 200 });
      },
    });
    const POST = withRouteTiming(handler);

    const before = (getCounters() as any)["csrf.fail"] || 0;
    const res = await (POST as any)(
      makeReq("http://localhost/api/test", {
        method: "POST",
        headers: {
          origin: "https://evil.example",
          referer: "https://evil.example/path",
        } as any,
      })
    );
    const after = (getCounters() as any)["csrf.fail"] || 0;

    expect(res.status).toBe(403);
    expect(after - before).toBe(1);
  });

  test("Global IP rate-limit enforced once (second request 429 and single counter increment)", async () => {
    process.env = {
      ...origEnv,
      NODE_ENV: "test",
      NEXT_PUBLIC_BASE_URL: "http://localhost:3030",
      GLOBAL_MUTATION_RATE_LIMIT: "1",
      GLOBAL_MUTATION_RATE_WINDOW_MS: "60000",
    } as any;

    const handler = createApiHandler({
      async handler() {
        return Response.json({ ok: true }, { status: 200 });
      },
    });
    const POST = withRouteTiming(handler);

    const ipHeaders = { "x-forwarded-for": "1.2.3.4", origin: "http://localhost:3030", referer: "http://localhost:3030/page" } as any;
    const before = (getCounters() as any)["rate_limit.hit"] || 0;

    const ok1 = await (POST as any)(makeReq("http://localhost/api/test", { method: "POST", headers: ipHeaders }));
    const hit = await (POST as any)(makeReq("http://localhost/api/test", { method: "POST", headers: ipHeaders }));
    const after = (getCounters() as any)["rate_limit.hit"] || 0;

    expect(ok1.status).toBe(200);
    expect(hit.status).toBe(429);
    expect(after - before).toBe(1);
  });
});


