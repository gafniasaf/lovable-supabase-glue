/**
 * Lesson service functions
 *
 * - listLessonsForCourseServer: List lessons for a course in server components
 * - createLessonApi: Create a lesson in route handlers (or in-memory in tests)
 */
// @ts-nocheck

import { getRouteHandlerSupabase, getServerComponentSupabase } from "@/lib/supabaseServer";
import { isTestMode } from "@/lib/testMode";
import { addTestLesson, listTestLessonsByCourse } from "@/lib/testStore";

type CreateLessonInput = { course_id: string; title: string; content: string; order_index: number; file_key?: string };

export async function listLessonsForCourseServer(courseId: string) {
  if (isTestMode()) return listTestLessonsByCourse(courseId) as any[];
  const supabase = getServerComponentSupabase();
  const { data, error } = await supabase
    .from("lessons")
    .select("id,title,order_index,file_key,created_at")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createLessonApi(input: CreateLessonInput) {
  if (isTestMode()) {
    const ts = Date.now().toString();
    const suffix = ts.slice(-12).padStart(12, '0');
    const fake = {
      id: `bbbbbbbb-bbbb-bbbb-bbbb-${suffix}`,
      ...input,
      created_at: new Date().toISOString()
    } as any;
    addTestLesson(fake);
    return fake;
  }
  const supabase = getRouteHandlerSupabase();
  const { data, error } = await supabase
    .from("lessons")
    .insert(input)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}


