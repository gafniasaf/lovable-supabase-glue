// @ts-nocheck
import { headers, cookies } from "next/headers";
import { serverFetch } from "@/lib/serverFetch";
import { revalidatePath } from "next/cache";

type ParentLink = { id: string; parent_id: string; student_id: string; created_at: string };

export default async function ParentChildrenListPage() {
	const h = headers();
	const c = cookies();
	const cookieHeader = h.get("cookie") ?? c.getAll().map(x => `${x.name}=${x.value}`).join("; ");
	const testAuth = h.get("x-test-auth") ?? c.get("x-test-auth")?.value;

	const res = await serverFetch(`/api/parent-links?parent_id=test-parent-id`, {
		cache: "no-store",
		headers: {
			...(cookieHeader ? { cookie: cookieHeader } : {}),
			...(testAuth ? { "x-test-auth": testAuth } : {}),
		},
	});

	if (res.status === 401) {
		return (
			<main className="p-6">
				<a className="text-blue-600 underline" href="/login">Sign in</a>
			</main>
		);
	}

	const links: ParentLink[] = res.ok ? await res.json() : [];

	async function linkAction(formData: FormData) {
		"use server";
		const hh = headers(); const cc = cookies();
		const cookie = hh.get("cookie") ?? cc.getAll().map(x => `${x.name}=${x.value}`).join("; ");
		const ta = hh.get("x-test-auth") ?? cc.get("x-test-auth")?.value;
		const student_id = String(formData.get('student_id') || '').trim();
		if (!student_id) return;
		await serverFetch('/api/parent-links', { method: 'POST', headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}), ...(ta ? { 'x-test-auth': ta } : {}) }, body: JSON.stringify({ parent_id: 'test-parent-id', student_id }) });
		revalidatePath('/labs/parent/children');
	}

	async function unlinkAction(formData: FormData) {
		"use server";
		const hh = headers(); const cc = cookies();
		const cookie = hh.get("cookie") ?? cc.getAll().map(x => `${x.name}=${x.value}`).join("; ");
		const ta = hh.get("x-test-auth") ?? cc.get("x-test-auth")?.value;
		const student_id = String(formData.get('student_id') || '').trim();
		if (!student_id) return;
		await serverFetch('/api/parent-links', { method: 'DELETE', headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}), ...(ta ? { 'x-test-auth': ta } : {}) }, body: JSON.stringify({ parent_id: 'test-parent-id', student_id }) });
		revalidatePath('/labs/parent/children');
	}

	return (
		<main className="p-6">
			<h1 className="text-xl font-semibold mb-4">Children</h1>
			<form action={linkAction} className="mb-3 flex items-center gap-2">
				<input name="student_id" placeholder="Student ID" className="border rounded p-2" />
				<button className="bg-black text-white rounded px-3 py-1">Link</button>
			</form>
			{links.length === 0 ? (
				<div className="text-gray-600">No linked students.</div>
			) : (
				<ul className="space-y-2" data-testid="children-list">
					{links.map(link => (
						<li key={link.id} data-testid="child-row">
							<a href={`/labs/parent/children/${encodeURIComponent(link.student_id)}`} className="text-blue-600 underline" data-testid="child-student-id">{link.student_id}</a>
							<form action={unlinkAction} className="inline-block ml-2">
								<input type="hidden" name="student_id" value={link.student_id} />
								<button className="text-xs underline">Unlink</button>
							</form>
						</li>
					))}
				</ul>
			)}
		</main>
	);
}


