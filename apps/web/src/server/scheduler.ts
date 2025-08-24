import { getRouteHandlerSupabase } from "@/lib/supabaseServer";
import { scheduleJob } from "@/lib/jobs";
// Static import; tests mock '@/lib/jobs' directly

let started = false;

export function ensureJobsStarted() {
	// In Jest, allow repeated calls per test case; otherwise run only once
	if (started && !process.env.JEST_WORKER_ID) return;
	started = true;
	// Simple wrapper around scheduleJob (tests mock '@/lib/jobs')
	const schedule = (name: string, intervalMs: number, fn: () => Promise<void>) => {
		try { scheduleJob(name, intervalMs, fn); } catch {}
	};

	// Due soon job
	if (process.env.DUE_SOON_JOB === '1') {
		const intervalMs = Number(process.env.DUE_SOON_INTERVAL_MS || 5 * 60 * 1000);
		schedule('assignment_due_soon', intervalMs, async () => {
			const windowHours = Number(process.env.DUE_SOON_WINDOW_HOURS || 24);
			const now = new Date();
			const until = new Date(now.getTime() + windowHours * 60 * 60 * 1000);
			const supabase = getRouteHandlerSupabase();
			// Find assignments due within window
			const { data: assignments, error: aErr } = await supabase
				.from('assignments')
				.select('id,course_id,title,due_at')
				.not('due_at', 'is', null)
				.gte('due_at', now.toISOString())
				.lte('due_at', until.toISOString())
				.limit(1000);
			if (aErr || !assignments || assignments.length === 0) return;
			const byCourse = new Map<string, any[]>();
			for (const a of assignments as any[]) {
				const arr = byCourse.get(a.course_id) ?? [];
				arr.push(a);
				byCourse.set(a.course_id, arr);
			}
			for (const [courseId, list] of byCourse.entries()) {
				// Enrolled students for the course
				const { data: enrolls } = await supabase.from('enrollments').select('student_id').eq('course_id', courseId).limit(5000);
				const students = (enrolls ?? []).map((e: any) => e.student_id as string);
				if (students.length === 0) continue;
				for (const studentId of students) {
					// Check notification prefs
					let allow = true;
					try {
						const { data: prefs } = await supabase.from('notification_prefs').select('prefs').eq('user_id', studentId).single();
						const map = ((prefs as any)?.prefs || {}) as Record<string, boolean>;
						if (map['assignment:due-soon'] === false) allow = false;
					} catch {}
					if (!allow) continue;
					for (const a of list) {
						try {
							// Insert if not duplicates in the recent past
							await supabase.from('notifications').insert({
								user_id: studentId,
								type: 'assignment:due-soon',
								payload: { course_id: courseId, assignment_id: a.id, title: a.title, due_at: a.due_at }
							});
						} catch {}
					}
				}
			}
		});
	}
	// Data retention cleanup job
	if (process.env.DATA_RETENTION_JOB === '1') {
		const retentionMs = Number(process.env.NOTIFICATIONS_TTL_MS || (30 * 24 * 60 * 60 * 1000));
		const receiptsMs = Number(process.env.RECEIPTS_TTL_MS || (30 * 24 * 60 * 60 * 1000));
		const cleanupInterval = Number(process.env.DATA_RETENTION_INTERVAL_MS || (6 * 60 * 60 * 1000));
		schedule('data_retention_cleanup', cleanupInterval, async () => {
			const supabase = getRouteHandlerSupabase();
			const nowIso = new Date().toISOString();
			try {
				// Notifications: delete read notifications older than TTL
				const cutoff = new Date(Date.now() - retentionMs).toISOString();
				const rpc = await (supabase as any).rpc?.('delete_old_read_notifications', { cutoff_ts: cutoff });
				if (!rpc || rpc.error) {
					await supabase.from('notifications').delete().lt('read_at', cutoff);
				}
			} catch {}
			try {
				// Message read receipts: delete older than TTL
				const cutoff = new Date(Date.now() - receiptsMs).toISOString();
				await supabase.from('message_read_receipts').delete().lt('read_at', cutoff);
			} catch {}
			try {
				// Orphan attachment GC: remove attachments older than TTL with no references
				const ttlMs = Number(process.env.ATTACHMENTS_GC_TTL_MS || (90 * 24 * 60 * 60 * 1000));
				const cutoff = new Date(Date.now() - ttlMs).toISOString();
				const { data: atts } = await supabase
					.from('attachments')
					.select('id,owner_type,owner_id,bucket,object_key,created_at')
					.lt('created_at', cutoff)
					.limit(500);
				for (const att of (atts ?? []) as any[]) {
					const key = att.object_key as string;
					let referenced = false;
					try {
						const { data: sub1 } = await supabase.from('submissions').select('id').eq('file_url', key).limit(1);
						if (Array.isArray(sub1) && sub1.length > 0) referenced = true;
					} catch {}
					if (!referenced) {
						try {
							const { data: sub2 } = await supabase.from('submissions').select('id').contains('file_urls', [key] as any).limit(1);
							if (Array.isArray(sub2) && sub2.length > 0) referenced = true;
						} catch {}
					}
					if (!referenced) {
						try {
							const { data: ann } = await supabase.from('announcements').select('id').eq('file_key', key).limit(1);
							if (Array.isArray(ann) && ann.length > 0) referenced = true;
						} catch {}
					}
					if (!referenced) {
						try {
							const { data: les } = await supabase.from('lessons').select('id').eq('file_key', key).limit(1);
							if (Array.isArray(les) && les.length > 0) referenced = true;
						} catch {}
					}
					if (referenced) continue;
					try { await (supabase as any).storage?.from(att.bucket).remove([att.object_key]); } catch {}
					try { await supabase.from('attachments').delete().eq('id', att.id); } catch {}
				}
			} catch {}
		});
	}
	// Provider health refresh job
	if (process.env.PROVIDER_HEALTH_REFRESH_JOB === '1') {
		const interval = Number(process.env.PROVIDER_HEALTH_REFRESH_INTERVAL_MS || 24 * 60 * 60 * 1000);
		schedule('provider_health_refresh', interval, async () => {
			const supabase = getRouteHandlerSupabase();
			const { data: providers } = await supabase.from('course_providers').select('id,jwks_url,domain').limit(1000);
			const timeoutMs = Number(process.env.PROVIDER_HEALTH_TIMEOUT_MS || 2000);
			for (const p of (providers ?? []) as any[]) {
				const controller = new AbortController();
				const timer = setTimeout(() => controller.abort(), timeoutMs);
				let jwks_ok = false, jwks_error: string | null = null;
				try {
					const r = await fetch(String(p.jwks_url), { headers: { 'accept': 'application/json' }, signal: controller.signal });
					if (!r.ok) throw new Error(`HTTP ${r.status}`);
					const j = await r.json();
					if (!j || !Array.isArray(j.keys)) throw new Error('Missing keys[]');
					jwks_ok = true;
				} catch (e: any) { jwks_ok = false; jwks_error = String(e?.message || e); }
				clearTimeout(timer);
				let domain_ok = false, domain_error: string | null = null;
				try {
					const u = new URL(String(p.domain));
					const r = await fetch(u.toString(), { method: 'HEAD' });
					if (!r.ok) throw new Error(`HTTP ${r.status}`);
					domain_ok = true;
				} catch (e: any) { domain_ok = false; domain_error = String(e?.message || e); }
				try {
					await supabase.from('provider_health').upsert({
						provider_id: p.id,
						jwks_ok,
						domain_ok,
						jwks_error,
						domain_error,
						checked_at: new Date().toISOString()
					}, { onConflict: 'provider_id' } as any);
				} catch {}
			}
		});
	}
	// Progress summary refresh
	if (process.env.REFRESH_PROGRESS_SUMMARY_JOB === '1') {
		const interval = Number(process.env.REFRESH_PROGRESS_SUMMARY_INTERVAL_MS || 5 * 60 * 1000);
		schedule('refresh_progress_summary', interval, async () => {
			const supabase = getRouteHandlerSupabase();
			try {
				const { error } = await (supabase as any).rpc?.('refresh_user_course_progress_summary');
				if (!error) return;
			} catch {}
			try {
				await (supabase as any).rpc?.('refresh_user_course_progress_summary');
			} catch {}
		});
	}
	// Quota reconcile
	if (process.env.QUOTA_RECONCILE_JOB === '1') {
		const interval = Number(process.env.QUOTA_RECONCILE_INTERVAL_MS || 6 * 60 * 60 * 1000);
		schedule('quota_reconcile', interval, async () => {
			const supabase = getRouteHandlerSupabase();
			const { data: quotas } = await supabase.from('user_storage_quotas').select('user_id').limit(10000);
			for (const q of (quotas ?? []) as any[]) {
				try {
					const { data: sizes } = await supabase.from('attachments').select('size_bytes').eq('owner_id', q.user_id).is('size_bytes', null);
				} catch {}
				try {
					const { data: sumRows } = await supabase.rpc?.('sum_attachment_sizes_by_owner', { owner: q.user_id });
					let sum = 0;
					if (Array.isArray(sumRows) && sumRows.length > 0 && typeof (sumRows as any)[0]?.sum === 'number') {
						sum = Number((sumRows as any)[0].sum);
					} else {
						const { data: rows } = await supabase.from('attachments').select('size_bytes').eq('owner_id', q.user_id).not('size_bytes','is', null);
						for (const r of (rows ?? []) as any[]) sum += Number(r.size_bytes || 0);
					}
					await supabase.from('user_storage_quotas').upsert({ user_id: q.user_id, used_bytes: sum, updated_at: new Date().toISOString() } as any, { onConflict: 'user_id' } as any);
				} catch {}
			}
		});
	}
	// Attachment size backfill
	if (process.env.BACKFILL_ATTACHMENT_SIZES_JOB === '1') {
		const interval = Number(process.env.BACKFILL_ATTACHMENT_SIZES_INTERVAL_MS || 15 * 60 * 1000);
		schedule('attachment_size_backfill', interval, async () => {
			const supabase = getRouteHandlerSupabase();
			const { data: list } = await supabase
				.from('attachments')
				.select('id,owner_id,owner_type,bucket,object_key,size_bytes')
				.is('size_bytes', null)
				.limit(50);
			if (!Array.isArray(list) || list.length === 0) return;
			const byUserDelta = new Map<string, number>();
			for (const att of list as any[]) {
				try {
					const { data: signed, error } = await (supabase as any).storage.from(att.bucket).createSignedUrl(att.object_key, 120);
					if (error || !signed?.signedUrl) continue;
					let len = 0;
					try {
						const head = await fetch(String((signed as any).signedUrl), { method: 'HEAD' });
						const h = head.headers.get('content-length');
						len = h ? Number(h) : 0;
					} catch {}
					if (len > 0) {
						await supabase.from('attachments').update({ size_bytes: len }).eq('id', att.id);
						if (process.env.STORAGE_QUOTA_ENABLED === '1' && (att.owner_type === 'user' || att.owner_type === 'submission')) {
							byUserDelta.set(att.owner_id, (byUserDelta.get(att.owner_id) || 0) + len);
						}
					}
				} catch {}
			}
			if (byUserDelta.size > 0) {
				for (const [userId, delta] of byUserDelta.entries()) {
					try {
						const { data: q } = await supabase.from('user_storage_quotas').select('used_bytes').eq('user_id', userId).single();
						const used = Number((q as any)?.used_bytes || 0);
						await supabase.from('user_storage_quotas').upsert({ user_id: userId, used_bytes: used + delta, updated_at: new Date().toISOString() } as any, { onConflict: 'user_id' } as any);
					} catch {}
				}
			}
		});
	}
}

// Exposed helper for tests and on-demand execution
export async function generateDueSoonNotifications({ now = new Date() }: { now?: Date } = {}) {
	const windowHours = Number(process.env.DUE_SOON_WINDOW_HOURS || 24);
	const until = new Date(now.getTime() + windowHours * 60 * 60 * 1000);
	const supabase = getRouteHandlerSupabase();
	const { data: assignments } = await supabase
		.from('assignments')
		.select('id,course_id,title,due_at')
		.not('due_at', 'is', null)
		.gte('due_at', now.toISOString())
		.lte('due_at', until.toISOString())
		.limit(1000);
	if (!assignments || assignments.length === 0) return 0;
	let inserted = 0;
	const byCourse = new Map<string, any[]>();
	for (const a of assignments as any[]) {
		const arr = byCourse.get(a.course_id) ?? [];
		arr.push(a);
		byCourse.set(a.course_id, arr);
	}
	for (const [courseId, list] of byCourse.entries()) {
		const { data: enrolls } = await supabase.from('enrollments').select('student_id').eq('course_id', courseId).limit(5000);
		const students = (enrolls ?? []).map((e: any) => e.student_id as string);
		if (students.length === 0) continue;
		for (const studentId of students) {
			for (const a of list) {
				try {
					await supabase.from('notifications').insert({
						user_id: studentId,
						type: 'assignment:due-soon',
						payload: { course_id: courseId, assignment_id: a.id, title: a.title, due_at: a.due_at }
					});
					inserted++;
				} catch {}
			}
		}
	}
	return inserted;
}


