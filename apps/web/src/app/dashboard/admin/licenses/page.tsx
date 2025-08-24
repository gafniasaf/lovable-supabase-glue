async function fetchLicenses(): Promise<any[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/registry/licenses`, { cache: 'no-store', headers: { accept: 'application/json' } });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.rows) ? json.rows : [];
  } catch { return []; }
}

export default async function AdminLicensesPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
	const rows = await fetchLicenses();
	const status = typeof searchParams?.status === 'string' ? searchParams?.status.toLowerCase() : '';
	const course = typeof searchParams?.course === 'string' ? searchParams?.course.toLowerCase() : '';
	const filtered = rows.filter((r: any) => {
		const sOk = status ? String(r.status || '').toLowerCase().includes(status) : true;
		const cOk = course ? String(r.external_course_id || '').toLowerCase().includes(course) : true;
		return sOk && cOk;
	});
	return (
		<section className="p-6 space-y-4" aria-label="Licenses">
			<h1 className="text-xl font-semibold">Licenses</h1>
			<form method="get" className="flex flex-wrap gap-2">
				<input name="status" defaultValue={typeof searchParams?.status === 'string' ? searchParams?.status : ''} placeholder="status contains..." className="border px-2 py-1 rounded" />
				<input name="course" defaultValue={typeof searchParams?.course === 'string' ? searchParams?.course : ''} placeholder="course id contains..." className="border px-2 py-1 rounded" />
				<button type="submit" className="border px-3 py-1 rounded">Filter</button>
				<a href="/api/admin/export?entity=licenses&format=csv" className="border px-3 py-1 rounded">Export CSV</a>
			</form>
			<table className="min-w-full border">
				<thead>
					<tr className="bg-gray-50 text-left"><th className="p-2 border">Provider</th><th className="p-2 border">Course</th><th className="p-2 border">Seats</th><th className="p-2 border">Used</th><th className="p-2 border">Status</th></tr>
				</thead>
				<tbody>
					{filtered.map((r: any) => (
						<tr key={r.id} className="hover:bg-gray-50">
							<td className="p-2 border">{r.provider_id}</td>
							<td className="p-2 border">{r.external_course_id}</td>
							<td className="p-2 border">{r.seats_total}</td>
							<td className="p-2 border">{r.seats_used}</td>
							<td className="p-2 border">{r.status}</td>
						</tr>
					))}
					{filtered.length === 0 && (
						<tr><td className="p-2 border" colSpan={5}>No licenses</td></tr>
					)}
				</tbody>
			</table>
		</section>
	);
}


