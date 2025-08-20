// @ts-nocheck
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createParentLinksGateway } from "@/lib/data/parentLinks";
import Trans from "@/lib/i18n/Trans";

export default async function AdminParentLinksPage({ searchParams }: { searchParams?: { [k: string]: string | string[] | undefined } }) {
	const parentId = (searchParams?.parent_id as string) || "";
	let rows: any[] = [];
	if (parentId) {
		rows = await createParentLinksGateway().listByParent(parentId).catch(() => []);
	}

	async function addAction(formData: FormData) {
		"use server";
		const pid = String(formData.get("parent_id") || "");
		const sid = String(formData.get("student_id") || "");
		await createParentLinksGateway().create({ parent_id: pid, student_id: sid });
		revalidatePath(`/dashboard/admin/parent-links`);
		redirect(`/dashboard/admin/parent-links?parent_id=${encodeURIComponent(pid)}`);
	}

	async function removeAction(formData: FormData) {
		"use server";
		const pid = String(formData.get("parent_id") || "");
		const sid = String(formData.get("student_id") || "");
		await createParentLinksGateway().remove({ parent_id: pid, student_id: sid });
		revalidatePath(`/dashboard/admin/parent-links`);
		redirect(`/dashboard/admin/parent-links?parent_id=${encodeURIComponent(pid)}`);
	}

	async function loadAction(_formData: FormData): Promise<void> {
		"use server";
		return;
	}

	return (
		<section className="p-6 space-y-4" aria-label="Parent links">
			<h1 className="text-xl font-semibold"><Trans keyPath="admin.parentLinks.title" fallback="Admin: Parent Links" /></h1>
			<form className="flex gap-2 items-center" action={loadAction}>
				<input name="parent_id" defaultValue={parentId} placeholder="parent_id (in query)" className="border rounded px-2 py-1" />
				<button className="border rounded px-3 py-1"><Trans keyPath="common.load" fallback="Load" /></button>
				<span className="text-sm text-gray-500"><Trans keyPath="admin.parentLinks.tip" fallback="Tip: append ?parent_id=... to the URL" /></span>
			</form>

			<form action={addAction} className="flex gap-2" data-testid="add-link-form">
				<input name="parent_id" placeholder="parent_id" defaultValue={parentId} className="border rounded px-2 py-1" data-testid="parent-id-input" />
				<input name="student_id" placeholder="student_id" className="border rounded px-2 py-1" data-testid="student-id-input" />
				<button className="bg-black text-white rounded px-3 py-1" type="submit" data-testid="add-link-btn"><Trans keyPath="common.add" fallback="Add" /></button>
			</form>

			{parentId ? (
				<table className="w-full border" data-testid="links-list">
					<thead>
						<tr className="bg-gray-50 text-left">
							<th className="p-2"><Trans keyPath="admin.parentLinks.columns.student" fallback="Student" /></th>
							<th className="p-2"><Trans keyPath="admin.parentLinks.columns.actions" fallback="Actions" /></th>
						</tr>
					</thead>
					<tbody>
						{(rows ?? []).map((r) => (
							<tr key={r.id} className="border-t" data-testid="link-row">
								<td className="p-2" data-testid="link-student">{r.student_id}</td>
								<td className="p-2">
									<form action={removeAction} className="inline">
										<input type="hidden" name="parent_id" value={parentId} />
										<input type="hidden" name="student_id" value={r.student_id} />
										<button className="border rounded px-2 py-1" data-testid="remove-link-btn"><Trans keyPath="common.remove" fallback="Remove" /></button>
									</form>
								</td>
							</tr>
						))}
						{(!rows || rows.length === 0) && (
							<tr>
								<td className="p-2 text-gray-500" colSpan={2}>No links yet.</td>
							</tr>
						)}
					</tbody>
				</table>
			) : (
				<p className="text-gray-600"><Trans keyPath="admin.parentLinks.provideHint" fallback="Provide a parent_id via the query string to view links." /></p>
			)}
		</section>
	);
}

export const dynamic = "force-dynamic";

