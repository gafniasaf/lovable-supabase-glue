import { GET as DashboardGET } from "../../apps/web/src/app/api/dashboard/route";

function makeReq(headers?: Record<string, string>) {
  return new Request("http://localhost/api/dashboard", { headers: { ...(headers || {}) } });
}

describe("GET /api/dashboard", () => {
  beforeEach(() => {
    process.env.TEST_MODE = "1";
  });

  test("unauthenticated returns 401 with request-id header", async () => {
    // clear any simulated auth
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.cookies?.clear?.();
    // @ts-ignore
    globalThis.__TEST_HEADERS_STORE__?.headers?.clear?.();
    const res = await (DashboardGET as any)(makeReq());
    expect(res.status).toBe(401);
    expect(res.headers.get('x-request-id')).toBeTruthy();
  });

  test("teacher returns 200", async () => {
    const res = await (DashboardGET as any)(makeReq({ "x-test-auth": "teacher" }));
    expect(res.status).toBe(200);
  });
});


