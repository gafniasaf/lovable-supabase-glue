import { getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { isTestMode } from "@/lib/testMode";
import { addTestAnnouncement, listTestAnnouncementsByCourse, deleteTestAnnouncement, listTestEnrollmentsByCourse, listTestParentsForStudent, addTestNotification } from "@/lib/testStore";
import type { AnnouncementCreateRequest } from "@education/shared";

export async function createAnnouncementApi(input: AnnouncementCreateRequest & { file_key?: string | null }, teacherId: string) {
  if (isTestMode()) {
    const ts = Date.now().toString();
    const suffix = ts.slice(-12).padStart(12, "0");
    const row = {
      id: `aaaaaaaa-aaaa-aaaa-aaaa-${suffix}`,
      course_id: input.course_id,
      teacher_id: teacherId,
      title: input.title,
      body: input.body,
      publish_at: input.publish_at ?? null,
      file_key: input.file_key ?? null,
      created_at: new Date().toISOString()
    };
    addTestAnnouncement(row);
    // Producer: if publish_at is now or past (or null), notify enrolled students and their parents
    const publishAt = row.publish_at ? new Date(row.publish_at) : null;
    const shouldNotifyNow = !publishAt || publishAt <= new Date();
    if (shouldNotifyNow) {
      try {
        const enrolls = (listTestEnrollmentsByCourse(input.course_id) as any[]) || [];
        for (const e of enrolls) {
          addTestNotification({ user_id: e.student_id, type: 'announcement:published', payload: { course_id: row.course_id, announcement_id: row.id, title: row.title } });
          const parentIds = (listTestParentsForStudent(e.student_id) as string[]) || [];
          for (const pid of parentIds) {
            addTestNotification({ user_id: pid, type: 'announcement:published', payload: { course_id: row.course_id, announcement_id: row.id, title: row.title } });
          }
        }
      } catch {}
    }
    return row as any;
  }
  const supabase = getRouteHandlerSupabase();
  const { data, error } = await supabase
    .from("announcements")
    .insert({
      course_id: input.course_id,
      teacher_id: teacherId,
      title: input.title,
      body: input.body,
      publish_at: input.publish_at ? new Date(input.publish_at).toISOString() : null,
      file_key: input.file_key ?? null
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  // Producer: if publish_at is now or past (or null), notify enrolled students (best-effort)
  try {
    const publishAt = (data as any).publish_at ? new Date((data as any).publish_at) : null;
    const shouldNotifyNow = !publishAt || publishAt <= new Date();
    if (shouldNotifyNow) {
      const { data: enrolls } = await supabase
        .from('enrollments')
        .select('student_id')
        .eq('course_id', (data as any).course_id);
      const rows = (enrolls ?? []).map((e: any) => ({
        user_id: e.student_id,
        type: 'announcement:published',
        payload: { course_id: (data as any).course_id, announcement_id: (data as any).id, title: (data as any).title }
      }));
      if (rows.length > 0) await supabase.from('notifications').insert(rows);
    }
  } catch {}
  return data;
}

export async function listAnnouncementsByCourse(courseId: string, includeUnpublished: boolean = false) {
  if (isTestMode()) {
    const rows = listTestAnnouncementsByCourse(courseId) as any[];
    if (includeUnpublished) return rows;
    const now = Date.now();
    return rows.filter(r => !r.publish_at || Date.parse(r.publish_at) <= now);
  }
  const supabase = getRouteHandlerSupabase();
  let q = supabase
    .from("announcements")
    .select("id,course_id,teacher_id,title,body,file_key,publish_at,created_at")
    .eq("course_id", courseId)
    .order("created_at", { ascending: false });
  if (!includeUnpublished) {
    const nowIso = new Date().toISOString();
    // Show immediately if publish_at is null, or scheduled in the past
    q = q.or(`publish_at.is.null,publish_at.lte.${nowIso}`);
  }
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function deleteAnnouncementApi(id: string) {
  if (isTestMode()) return deleteTestAnnouncement(id) as any;
  const supabase = getRouteHandlerSupabase();
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return { ok: true } as const;
}


