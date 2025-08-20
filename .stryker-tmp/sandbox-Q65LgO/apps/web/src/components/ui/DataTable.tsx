// @ts-nocheck
import React from "react";

export type Column<T> = { key: keyof T; header: string; render?: (row: T) => React.ReactNode; className?: string };

export default function DataTable<T extends { id?: string | number }>({ columns, rows, empty }: { columns: Column<T>[]; rows: T[]; empty?: React.ReactNode }) {
	const [sortKey, setSortKey] = React.useState<keyof T | null>(null);
	const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('asc');
	const sorted = React.useMemo(() => {
		if (!sortKey) return rows || [];
		const copy = [...(rows || [])];
		copy.sort((a: any, b: any) => {
			const av = a?.[sortKey as string];
			const bv = b?.[sortKey as string];
			if (av == null && bv == null) return 0;
			if (av == null) return sortDir === 'asc' ? -1 : 1;
			if (bv == null) return sortDir === 'asc' ? 1 : -1;
			if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
			const as = String(av).toLowerCase();
			const bs = String(bv).toLowerCase();
			return sortDir === 'asc' ? as.localeCompare(bs) : bs.localeCompare(as);
		});
		return copy;
	}, [rows, sortKey, sortDir]);
	function onSort(key: keyof T) {
		if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
		else { setSortKey(key); setSortDir('asc'); }
	}
	return (
		<table className="w-full text-sm border">
			<thead>
				<tr className="bg-gray-50 text-left">
					{columns.map(c => (
						<th
							key={String(c.key)}
							scope="col"
							aria-sort={sortKey === c.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
							className={"p-2 border cursor-pointer select-none " + (c.className || '')}
							onClick={() => onSort(c.key)}
						>
							<span>{c.header}</span>
							{sortKey === c.key ? <span className="ml-1 text-gray-400">{sortDir === 'asc' ? '▲' : '▼'}</span> : null}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{(sorted || []).map((r, idx) => (
					<tr key={(r as any).id ?? idx} className="border-b">
						{columns.map(c => <td key={String(c.key)} className={"p-2 border " + (c.className || '')}>{c.render ? c.render(r) : String((r as any)[c.key])}</td>)}
					</tr>
				))}
				{sorted.length === 0 && (
					<tr><td className="p-2 text-gray-500" colSpan={columns.length}>{empty || 'No data'}</td></tr>
				)}
			</tbody>
		</table>
	);
}


