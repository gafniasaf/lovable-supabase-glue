/**
 * User service functions
 *
 * - updateUserRole: Update a user's role in DB (or test store)
 */
import { getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { isTestMode } from "@/lib/testMode";
import { upsertTestProfile } from "@/lib/testStore";

export async function updateUserRole({ userId, role }: { userId: string; role: "student" | "teacher" | "parent" | "admin" }) {
  // Update user role in persistent DB or in-memory store when in test mode.
  if (isTestMode()) {
    upsertTestProfile({ id: userId, email: `${role}@example.com`, role });
    return { id: userId, role } as const;
  }
  const supabase = getRouteHandlerSupabase();
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);
  if (error) throw new Error(error.message);
  return { id: userId, role } as const;
}


