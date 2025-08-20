/**
 * Parent links service functions
 *
 * - createParentLink: Create a parent->student link (admin)
 * - deleteParentLink: Remove a link (admin)
 * - listChildrenForParent: List child links for a parent
 */
// @ts-nocheck

import { getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { isTestMode } from "@/lib/testMode";
import { addTestParentLink, listTestParentChildren, removeTestParentLink } from "@/lib/testStore";

type CreateInput = { parentId: string; studentId: string };

export async function createParentLink({ parentId, studentId }: CreateInput) {
  if (isTestMode()) {
    const row = { id: crypto.randomUUID(), parent_id: parentId, student_id: studentId, created_at: new Date().toISOString() } as any;
    addTestParentLink(row);
    return row;
  }
  const supabase = getRouteHandlerSupabase();
  const { data, error } = await supabase
    .from('parent_links')
    .insert({ parent_id: parentId, student_id: studentId })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteParentLink({ parentId, studentId }: CreateInput) {
  if (isTestMode()) {
    removeTestParentLink(parentId, studentId);
    return { ok: true } as const;
  }
  const supabase = getRouteHandlerSupabase();
  const { error } = await supabase
    .from('parent_links')
    .delete()
    .eq('parent_id', parentId)
    .eq('student_id', studentId);
  if (error) throw new Error(error.message);
  return { ok: true } as const;
}

export async function listChildrenForParent(parentId: string) {
  if (isTestMode()) {
    return listTestParentChildren(parentId) as any[];
  }
  const supabase = getRouteHandlerSupabase();
  const { data, error } = await supabase
    .from('parent_links')
    .select('id,parent_id,student_id,created_at')
    .eq('parent_id', parentId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}


