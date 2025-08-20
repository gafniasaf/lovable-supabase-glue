// @ts-nocheck
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getRouteHandlerSupabase } from "@/lib/supabaseServer";

export async function logout() {
  try {
    const supabase = getRouteHandlerSupabase();
    await supabase.auth.signOut();
  } catch {}
  try {
    const c = cookies();
    // Clear test-mode role cookie used in automated tests
    c.set("x-test-auth", "", { path: "/", maxAge: 0 });
    // Also clear cookie set with an explicit localhost domain (Playwright)
    try { c.set("x-test-auth", "", { path: "/", maxAge: 0, domain: "localhost" }); } catch {}
    // Hint for SSR headers to render as anonymous immediately after redirect
    c.set("just-logged-out", "1", { path: "/", maxAge: 5 });
  } catch {}
  // Force a server re-render so header reflects anonymous
  redirect("/dashboard");
}


