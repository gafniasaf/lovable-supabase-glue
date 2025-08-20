import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabaseServer";
import { getTestRoleFromCookie } from "@/lib/testMode";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const testRole = getTestRoleFromCookie();
  if (testRole) return <>{children}</>;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <>{children}</>;
}


