import React from "react";
import DropdownMenu from "./DropdownMenu";

export type Crumb = { label: string; href?: string; siblings?: { key?: string; label: string; href: string }[] };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
	return (
		<nav aria-label="Breadcrumb" className="text-sm">
			<ol className="flex items-center gap-1 text-gray-600">
				{items.map((c, idx) => (
					<li key={`${c.label}-${idx}`} className="flex items-center gap-1">
						{idx === items.length - 1 && c.siblings && c.siblings.length > 0 ? (
							<DropdownMenu
								label={<span aria-current="page" className="text-gray-900">{c.label}</span>}
								items={(c.siblings || []).map((s) => ({ key: s.key || s.href, label: s.label, onSelect: () => { window.location.href = s.href; } }))}
							/>
						) : c.href ? (
							<a className="underline" href={c.href}>{c.label}</a>
						) : (
							<span aria-current="page" className="text-gray-900">{c.label}</span>
						)}
						{idx < items.length - 1 ? <span aria-hidden="true" className="mx-1">/</span> : null}
					</li>
				))}
			</ol>
		</nav>
	);
}


