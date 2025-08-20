/**
 * Course service functions
 *
 * - createCourseServer: Create a default course from server components
 * - createCourseApi: Create a course in a route handler (or test store)
 * - listCoursesForTeacherServer: List teacher courses for server components
 */
// @ts-nocheck

import { getRouteHandlerSupabase, getServerComponentSupabase } from "@/lib/supabaseServer";
import { isTestMode } from "@/lib/testMode";
import { addTestCourse, listTestCoursesByTeacher } from "@/lib/testStore";
import { recordEvent } from "@/lib/events";

type CreateCourseInput = { title: string; description?: string | null };

export async function createCourseServer(user: { id: string }) {
  const supabase = getServerComponentSupabase();
  const { data, error } = await supabase
    .from("courses")
    .insert({ title: "Untitled Course", description: null, teacher_id: user.id })
    .select()
    .single();
  if (error) throw new Error(error.message);
  try { await recordEvent({ event_type: 'course.created', entity_type: 'course', entity_id: (data as any).id, user_id: user.id, meta: { title: (data as any)?.title ?? 'Untitled Course' } }); } catch {}
  return data;
}

export async function createCourseApi(
  user: { id: string },
  input: CreateCourseInput & { launch_kind?: string | null; launch_url?: string | null; provider_id?: string | null; scopes?: string[] | null }
) {
  if (isTestMode()) {
    const ts = Date.now().toString();
    const suffix = ts.slice(-12).padStart(12, '0');
    const fake = {
      id: `aaaaaaaa-aaaa-aaaa-aaaa-${suffix}`,
      title: input.title,
      description: input.description ?? null,
      teacher_id: user.id,
      created_at: new Date().toISOString(),
      launch_kind: (input as any).launch_kind ?? null,
      launch_url: (input as any).launch_url ?? null,
      provider_id: (input as any).provider_id ?? null,
      scopes: (input as any).scopes ?? null
    } as any;
    addTestCourse(fake);
    return fake;
  }
  const supabase = getRouteHandlerSupabase();
  const { data, error } = await supabase
    .from("courses")
    .insert({
      title: input.title,
      description: input.description ?? null,
      teacher_id: user.id,
      launch_kind: (input as any).launch_kind ?? null,
      launch_url: (input as any).launch_url ?? null,
      provider_id: (input as any).provider_id ?? null,
      scopes: (input as any).scopes ?? null
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function listCoursesForTeacherServer(user: { id: string }) {
  if (isTestMode()) return listTestCoursesByTeacher(user.id) as any[];
  const supabase = getServerComponentSupabase();
  const { data, error } = await supabase
    .from("courses")
    .select("id,title,description,created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}


