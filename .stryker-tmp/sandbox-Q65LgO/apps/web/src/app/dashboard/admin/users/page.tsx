// @ts-nocheck
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import DataTable, { type Column } from "@/components/ui/DataTable";

type UserRow = { id: string; display_name?: string | null; email?: string | null };

export default async function AdminUsersPage({ searchParams }: { searchParams?: { q?: string } }) {
	const q = (searchParams?.q || '').trim();
	let rows: UserRow[] = [];
	if (q) {
		try {
			const { serverFetch } = await import("@/lib/serverFetch");
			const res = await serverFetch(`/api/users?ids=${encodeURIComponent(q)}`, { cache: 'no-store' });
			rows = res.ok ? await res.json() : [];
		} catch {}
	}
	const columns: Column<UserRow>[] = [
		{ key: 'id', header: 'User ID', className: 'font-mono' },
		{ key: 'display_name', header: 'Name' },
		{ key: 'email', header: 'Email' }
	];
	return (
		<section className="p-6 space-y-4" aria-label="Users">
			<Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard/admin" }, { label: "Users" }]} />
			<h1 className="text-xl font-semibold">Users</h1>
			<form className="flex items-center gap-2" action="/dashboard/admin/users" method="get">
				<label className="text-sm" htmlFor="q">Lookup by IDs (comma-separated)</label>
				<input id="q" name="q" className="border rounded p-2" defaultValue={q} placeholder="id1,id2,..." />
				<button className="underline text-sm" type="submit">Search</button>
			</form>
			<DataTable columns={columns} rows={rows} empty={<span>No results</span>} />
		</section>
	);
}
