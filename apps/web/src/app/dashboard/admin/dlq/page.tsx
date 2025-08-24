//

async function fetchDlq(): Promise<any[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/admin/dlq`, { cache: 'no-store', headers: { accept: 'application/json' } });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.rows) ? json.rows : [];
  } catch { return []; }
}

export default async function AdminDlqPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
	const rows = await fetchDlq();
	const q = typeof searchParams?.q === 'string' ? searchParams?.q.toLowerCase() : '';
	const filtered = q
		? rows.filter((r: any) =>
			String(r.kind || '').toLowerCase().includes(q) || String(r.error || '').toLowerCase().includes(q)
		)
		: rows;
	return (
		<section className="p-6 space-y-4" aria-label="Dead Letters">
			<h1 className="text-xl font-semibold">Dead Letters</h1>
			<form method="get" className="flex gap-2">
				<input name="q" defaultValue={typeof searchParams?.q === 'string' ? searchParams?.q : ''} placeholder="Filter by kind/error" className="border px-2 py-1 rounded" />
				<button type="submit" className="border px-3 py-1 rounded">Filter</button>
				<a href="/api/admin/export?entity=dead_letters&format=csv" className="border px-3 py-1 rounded">Export CSV</a>
			</form>
			<table className="min-w-full border">
				<thead>
					<tr className="bg-gray-50 text-left"><th className="p-2 border">Kind</th><th className="p-2 border">Error</th><th className="p-2 border">Attempts</th><th className="p-2 border">Created</th></tr>
				</thead>
				<tbody>
					{filtered.map((r: any) => (
						<tr key={r.id} className="hover:bg-gray-50">
							<td className="p-2 border">{r.kind}</td>
							<td className="p-2 border">{r.error}</td>
							<td className="p-2 border">{r.attempts}</td>
							<td className="p-2 border">{r.created_at}</td>
						</tr>
					))}
					{filtered.length === 0 && (
						<tr><td className="p-2 border" colSpan={4}>No dead letters</td></tr>
					)}
				</tbody>
			</table>
		</section>
	);
}


