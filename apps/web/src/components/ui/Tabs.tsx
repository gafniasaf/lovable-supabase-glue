"use client";
import React from "react";

export function Tabs({ children, className = "" }: { children: React.ReactNode; className?: string }) {
	return <div className={["", className].join(" ")}>{children}</div>;
}

export function TabList({ children }: { children: React.ReactNode }) {
	return <div role="tablist" className="flex items-center gap-2 border-b bg-white/50" aria-label="Page tabs">{children}</div>;
}

export function Tab({ href, active, children }: { href: string; active?: boolean; children: React.ReactNode }) {
	return (
		<a role="tab" aria-selected={!!active} href={href} className={[
			"px-3 py-2 -mb-px border-b-2",
			active ? "border-black text-black" : "border-transparent text-gray-600 hover:text-gray-900"
		].join(" ")}>{children}</a>
	);
}


