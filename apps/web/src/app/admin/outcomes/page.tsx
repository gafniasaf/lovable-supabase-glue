"use client";
import { useState } from "react";
import { createInteractiveOutcomesGateway } from "@/lib/data/interactiveOutcomes";

export default function OutcomesAdminPage() {
	const [courseId, setCourseId] = useState<string>("");
	const [rows, setRows] = useState<any[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	async function load() {
		setLoading(true); setError(null);
		try {
			const data = await createInteractiveOutcomesGateway().listRecentForCourse(courseId);
			setRows(Array.isArray(data) ? data as any[] : []);
		} catch (e: any) {
			setError(String(e?.message || e));
		} finally {
			setLoading(false);
		}
	}

	return (
		<section className="p-6 space-y-4" aria-label="Outcomes">
			<h1 className="text-xl font-semibold">Recent Outcomes</h1>
			<div className="flex gap-2 items-center">
				<input className="border rounded px-2 py-1 w-[420px]" placeholder="course UUID" value={courseId} onChange={e => setCourseId(e.target.value)} />
				<button className="px-3 py-1 border rounded" onClick={load}>Load</button>
				{courseId ? (
					<a
						className="px-3 py-1 border rounded underline"
						href={createInteractiveOutcomesGateway().exportCsvUrl(courseId)}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={`Download CSV for course ${courseId}`}
					>
						Download CSV
					</a>
				) : null}
				{error ? <span className="text-sm text-red-600">{error}</span> : null}
			</div>
			<div className="text-sm text-gray-600">{loading ? 'Loading…' : `${rows.length} rows`}</div>
			<table className="min-w-full border text-sm">
				<thead>
					<tr className="bg-gray-50">
						<th className="border px-2 py-1 text-left">When</th>
						<th className="border px-2 py-1 text-left">User</th>
						<th className="border px-2 py-1 text-left">Type</th>
						<th className="border px-2 py-1 text-left">Score/Max</th>
						<th className="border px-2 py-1 text-left">Pct/Topic</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((r: any) => (
						<tr key={r.id}>
							<td className="border px-2 py-1">{new Date(r.created_at).toLocaleString()}</td>
							<td className="border px-2 py-1">{r.user_id}</td>
							<td className="border px-2 py-1">{r.score != null ? 'attempt.completed' : 'progress'}</td>
							<td className="border px-2 py-1">{r.score != null ? `${r.score}/${r.max}` : '-'}</td>
							<td className="border px-2 py-1">{r.pct != null ? `${r.pct}%` : (r.topic || '-')}</td>
						</tr>
					))}
				</tbody>
			</table>
		</section>
	);
}


