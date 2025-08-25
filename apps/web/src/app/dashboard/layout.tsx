import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabaseServer";
import { getTestRoleFromCookie, isTestMode } from "@/lib/testMode";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const testRole = getTestRoleFromCookie();
  // Allow bypass only when a concrete test role is present; otherwise require auth
  if (testRole) return <>{children}</>;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <>{children}</>;
}


