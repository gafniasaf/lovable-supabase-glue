/**
 * Module service functions
 *
 * - listModulesByCourse: List modules for a given course
 * - createModuleApi: Create a module
 * - updateModuleApi: Update a module's fields
 * - deleteModuleApi: Delete a module
 */
import { getRouteHandlerSupabase, getServerComponentSupabase } from "@/lib/supabaseServer";
import { isTestMode } from "@/lib/testMode";
import { addTestModule, listTestModulesByCourse, updateTestModule, deleteTestModule } from "@/lib/testStore";

type CreateModuleInput = { course_id: string; title: string; order_index: number };
type UpdateModuleInput = { title?: string; order_index?: number };

export async function listModulesByCourse(courseId: string) {
  // Return modules for a course, ordered by order_index.
  if (isTestMode()) return listTestModulesByCourse(courseId) as any[];
  const supabase = getServerComponentSupabase();
  const { data, error } = await supabase
    .from("modules")
    .select("id,course_id,title,order_index,created_at")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createModuleApi(input: CreateModuleInput) {
  // Create a new module for a course.
  if (isTestMode()) {
    const ts = Date.now().toString();
    const suffix = ts.slice(-12).padStart(12, '0');
    const fake = {
      id: `cccccccc-cccc-cccc-cccc-${suffix}`,
      ...input,
      created_at: new Date().toISOString()
    } as any;
    addTestModule(fake);
    return fake;
  }
  const supabase = getRouteHandlerSupabase();
  const { data, error } = await supabase
    .from("modules")
    .insert(input)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateModuleApi(id: string, data: UpdateModuleInput) {
  // Update module title and/or order_index.
  if (isTestMode()) {
    const updated = updateTestModule(id, data) as any;
    return updated ?? null;
  }
  const supabase = getRouteHandlerSupabase();
  const { data: row, error } = await supabase
    .from("modules")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return row;
}

export async function deleteModuleApi(id: string) {
  // Delete a module by id.
  if (isTestMode()) {
    deleteTestModule(id);
    return { ok: true };
  }
  const supabase = getRouteHandlerSupabase();
  const { error } = await supabase
    .from("modules")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true };
}


