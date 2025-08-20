// @ts-nocheck
import { headers, cookies } from "next/headers";
import { serverFetch } from "@/lib/serverFetch";

export default async function SystemRoleBadgePage() {
  const h = headers();
  const cookieHeader = h.get("cookie") ?? "";
  const testAuth = h.get("x-test-auth") ?? cookies().get("x-test-auth")?.value;

  const res = await serverFetch("/api/health", {
    cache: "no-store",
    headers: {
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
      ...(testAuth ? { "x-test-auth": testAuth } : {}),
    },
  });
  const data = await res.json();

  return (
    <main className="p-6 space-y-2">
      <div>
        <span className="font-medium">Role:</span> <span data-testid="role-value">{String(data.testRole)}</span>
      </div>
      <div>
        <span className="font-medium">Test mode:</span> <span data-testid="test-mode-value">{String(data.testMode)}</span>
      </div>
    </main>
  );
}


