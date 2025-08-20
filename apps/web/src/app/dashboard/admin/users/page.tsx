import Breadcrumbs from "@/components/ui/Breadcrumbs";
import DataTable, { type Column } from "@/components/ui/DataTable";
import InlineErrorDetails from "@/components/ui/InlineErrorDetails";

type UserRow = { id: string; display_name?: string | null; email?: string | null };

export default async function AdminUsersPage({ searchParams }: { searchParams?: { q?: string } }) {
	const q = (searchParams?.q || '').trim();
	let rows: UserRow[] = [];
	let loadOk = true;
	let requestId: string | null = null;
	if (q) {
		// Backend route not available yet; render a callout and keep page functional without querying
		loadOk = false;
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
			<div className="flex items-center gap-2 text-sm">
				<details>
					<summary className="underline cursor-pointer select-none">Quick filters</summary>
					<div className="mt-2 flex items-center gap-2">
						<button className="border rounded px-2 py-1">Has email</button>
						<button className="border rounded px-2 py-1">Missing name</button>
					</div>
				</details>
				<div className="ml-auto flex items-center gap-2">
					<label>Saved views</label>
					<select className="border rounded p-1">
						<option>Default</option>
						<option>New signups</option>
					</select>
					<button className="underline">★ Save</button>
				</div>
			</div>
			{!loadOk ? (
				<InlineErrorDetails message="We couldn’t load users." details={null} requestId={requestId} />
			) : (
				<DataTable columns={columns} rows={rows} empty={<span>No results</span>} />
			)}
		</section>
	);
}
