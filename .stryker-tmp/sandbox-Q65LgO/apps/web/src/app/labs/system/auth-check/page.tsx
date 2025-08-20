// @ts-nocheck
import { headers, cookies } from "next/headers";
import { serverFetch } from "@/lib/serverFetch";

type ProfileResponse = {
  id: string;
  email: string;
  role: string;
};

export default async function AuthCheckPage() {
  const incomingHeaders = headers();
  const cookieStore = cookies();

  const cookieHeader = incomingHeaders.get("cookie") ?? cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const testAuthHeader = incomingHeaders.get("x-test-auth") ?? "";
  const testAuth = testAuthHeader || cookieStore.get("x-test-auth")?.value || "";

  const res = await serverFetch("/api/user/profile", {
    cache: "no-store",
    headers: {
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
      ...(testAuth ? { "x-test-auth": testAuth } : {}),
    },
  });

  if (res.status === 401) {
    return (
      <main className="p-6">
        <div className="border rounded p-4 inline-block">
          <div className="text-lg font-medium mb-2">Auth check (read-only)</div>
          <p className="mb-2">You are not signed in</p>
          <a className="text-blue-600 underline" href="/login">Sign in</a>
        </div>
      </main>
    );
  }

  const data: ProfileResponse | null = res.ok ? await res.json() : null;

  return (
    <main className="p-6">
      <div className="border rounded p-4 inline-block">
        <div className="text-lg font-medium mb-2">Auth check (read-only)</div>
        {data ? (
          <div className="space-y-1">
            <div>
              <span className="text-gray-600 mr-2">email:</span>
              <span data-testid="auth-email">{data.email}</span>
            </div>
            <div>
              <span className="text-gray-600 mr-2">role:</span>
              <span data-testid="auth-role">{data.role}</span>
            </div>
          </div>
        ) : (
          <p>Unable to fetch profile.</p>
        )}
      </div>
    </main>
  );
}



