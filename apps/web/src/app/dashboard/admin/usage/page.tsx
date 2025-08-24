async function fetchUsage(): Promise<any[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/admin/usage`, { cache: 'no-store', headers: { accept: 'application/json' } });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.rows) ? json.rows : [];
  } catch { return []; }
}

export default async function AdminUsagePage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
	const rows = await fetchUsage();
	const metric = typeof searchParams?.metric === 'string' ? searchParams?.metric.toLowerCase() : '';
	const day = typeof searchParams?.day === 'string' ? searchParams?.day : '';
	const filtered = rows.filter((r: any) => {
		const mOk = metric ? String(r.metric || '').toLowerCase().includes(metric) : true;
		const dOk = day ? String(r.day || '').startsWith(day) : true;
		return mOk && dOk;
	});
	return (
		<section className="p-6 space-y-4" aria-label="Usage">
			<h1 className="text-xl font-semibold">Usage Counters</h1>
			<form method="get" className="flex flex-wrap gap-2">
				<input name="metric" defaultValue={typeof searchParams?.metric === 'string' ? searchParams?.metric : ''} placeholder="metric contains..." className="border px-2 py-1 rounded" />
				<input name="day" defaultValue={typeof searchParams?.day === 'string' ? searchParams?.day : ''} placeholder="YYYY-MM-DD" className="border px-2 py-1 rounded" />
				<button type="submit" className="border px-3 py-1 rounded">Filter</button>
				<a href="/api/admin/export?entity=usage&format=csv" className="border px-3 py-1 rounded">Export CSV</a>
			</form>
			<table className="min-w-full border">
				<thead>
					<tr className="bg-gray-50 text-left"><th className="p-2 border">Day</th><th className="p-2 border">Metric</th><th className="p-2 border">Count</th></tr>
				</thead>
				<tbody>
					{filtered.map((r: any) => (
						<tr key={`${r.day}-${r.metric}-${r.provider_id}-${r.course_id}`} className="hover:bg-gray-50">
							<td className="p-2 border">{r.day}</td>
							<td className="p-2 border">{r.metric}</td>
							<td className="p-2 border">{r.count}</td>
						</tr>
					))}
					{filtered.length === 0 && (
						<tr><td className="p-2 border" colSpan={3}>No usage data</td></tr>
					)}
				</tbody>
			</table>
		</section>
	);
}


