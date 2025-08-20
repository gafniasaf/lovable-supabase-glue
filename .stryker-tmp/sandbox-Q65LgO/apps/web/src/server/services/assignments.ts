/**
 * Assignment service functions
 *
 * - createAssignmentApi: Create an assignment via route handler (or test store)
 * - listAssignmentsByCourse: List assignments for a course
 * - updateAssignmentApi: Update an assignment
 * - deleteAssignmentApi: Delete an assignment
 */
// @ts-nocheck

import { getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { isTestMode } from "@/lib/testMode";
import {
  addTestAssignment,
  listTestAssignmentsByCourse,
  updateTestAssignment,
  deleteTestAssignment,
  listTestEnrollmentsByCourse,
  addTestNotification
} from "@/lib/testStore";
import type { AssignmentCreateRequest, AssignmentUpdateRequest } from "@education/shared";

export async function createAssignmentApi(input: AssignmentCreateRequest) {
  // Create a new assignment. In test-mode, returns a synthetic row.
  if (isTestMode()) {
    const ts = Date.now().toString();
    const suffix = ts.slice(-12).padStart(12, "0");
    const fake = {
      id: `cccccccc-cccc-cccc-cccc-${suffix}`,
      course_id: input.course_id,
      title: input.title,
      description: input.description ?? null,
      due_at: input.due_at ?? null,
      points: input.points ?? 100,
      created_at: new Date().toISOString()
    } as any;
    addTestAssignment(fake);
    try {
      // Notify enrolled students about new assignment
      const enrolls = listTestEnrollmentsByCourse(input.course_id) as any[];
      for (const e of enrolls) {
        addTestNotification({ user_id: e.student_id, type: 'assignment:new', payload: { assignment_id: fake.id, title: fake.title, due_at: fake.due_at ?? null, course_id: fake.course_id } });
      }
    } catch {}
    return fake;
  }
  const supabase = getRouteHandlerSupabase();
  const { data, error } = await supabase
    .from("assignments")
    .insert({
      course_id: input.course_id,
      title: input.title,
      description: input.description ?? null,
      due_at: input.due_at ? new Date(input.due_at).toISOString() : null,
      points: input.points ?? 100
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  try {
    // Producer: notify enrolled students about new assignment (prod)
    const { data: enrolls } = await supabase
      .from('enrollments')
      .select('student_id')
      .eq('course_id', input.course_id);
    const rows = (enrolls ?? []).map((e: any) => ({
      user_id: e.student_id,
      type: 'assignment:new',
      payload: { assignment_id: (data as any).id, title: (data as any).title, due_at: (data as any).due_at ?? null, course_id: (data as any).course_id }
    }));
    if (rows.length > 0) await supabase.from('notifications').insert(rows);
  } catch {}
  return data;
}

export async function listAssignmentsByCourse(courseId: string) {
  // Return assignments for the given course id.
  if (isTestMode()) return listTestAssignmentsByCourse(courseId) as any[];
  const supabase = getRouteHandlerSupabase();
  const { data, error } = await supabase
    .from("assignments")
    .select("id,course_id,title,description,due_at,points,created_at")
    .eq("course_id", courseId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listAssignmentsByCoursePaged(
  courseId: string,
  options?: { offset?: number; limit?: number }
): Promise<{ rows: any[]; total: number }>
{
  const offset = Math.max(0, options?.offset ?? 0);
  const limit = Math.max(1, Math.min(200, options?.limit ?? 50));
  if (isTestMode()) {
    const all = (listTestAssignmentsByCourse as any)(courseId) as any[];
    const rows = (all ?? []).slice(offset, offset + limit);
    return { rows, total: (all ?? []).length };
  }
  const supabase = getRouteHandlerSupabase();
  const { data, error, count } = await supabase
    .from('assignments')
    .select('id,course_id,title,description,due_at,points,created_at', { count: 'exact' as any })
    .eq('course_id', courseId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw new Error(error.message);
  return { rows: data ?? [], total: typeof count === 'number' ? count : 0 };
}

export async function updateAssignmentApi(id: string, data: AssignmentUpdateRequest) {
  // Update selected fields of an assignment identified by id.
  if (isTestMode()) return updateTestAssignment(id, data) as any;
  const supabase = getRouteHandlerSupabase();
  const { data: row, error } = await supabase
    .from("assignments")
    .update({
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.due_at !== undefined ? { due_at: data.due_at ? new Date(data.due_at).toISOString() : null } : {}),
      ...(data.points !== undefined ? { points: data.points } : {})
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return row;
}

export async function deleteAssignmentApi(id: string) {
  // Delete an assignment by id.
  if (isTestMode()) return deleteTestAssignment(id) as any;
  const supabase = getRouteHandlerSupabase();
  const { error } = await supabase.from("assignments").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true } as const;
}


