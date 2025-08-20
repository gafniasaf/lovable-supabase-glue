// @ts-nocheck
import { createAuditLogsGateway } from "@/lib/data/auditLogs";

export default async function AuditLogsPage() {
	const rows = await createAuditLogsGateway().list(100).catch(() => [] as any[]);
	return (
		<section className="p-6 space-y-4" aria-label="Audit logs">
			<h1 className="text-xl font-semibold">Audit logs</h1>
			{Array.isArray(rows) && rows.length > 0 ? (
				<table className="w-full text-sm border">
					<thead>
						<tr className="bg-gray-50">
							<th className="text-left p-2 border">When</th>
							<th className="text-left p-2 border">Action</th>
							<th className="text-left p-2 border">Entity</th>
							<th className="text-left p-2 border">Actor</th>
							<th className="text-left p-2 border">Details</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((r: any) => (
							<tr key={r.id}>
								<td className="p-2 border whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
								<td className="p-2 border">{r.action}</td>
								<td className="p-2 border">{r.entity_type}:{r.entity_id}</td>
								<td className="p-2 border font-mono text-xs">{r.actor_id || '-'}</td>
								<td className="p-2 border text-xs">{r.details ? JSON.stringify(r.details) : '-'}</td>
							</tr>
						))}
					</tbody>
				</table>
			) : (
				<div className="text-gray-600">No audit entries.</div>
			)}
		</section>
	);
}


