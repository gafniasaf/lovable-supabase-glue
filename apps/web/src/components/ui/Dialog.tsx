"use client";
import React from "react";

type DialogProps = {
	open: boolean;
	onClose: () => void;
	title?: string;
	children: React.ReactNode;
};

export function Dialog({ open, onClose, title, children }: DialogProps) {
	if (!open) return null;
	return (
		<div className="fixed inset-0 z-[1000] flex items-center justify-center">
			<div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
			<div role="dialog" aria-modal="true" className="relative bg-white rounded shadow-lg max-w-lg w-full p-4">
				<div className="flex items-center justify-between mb-2">
					<h2 className="font-medium">{title}</h2>
					<button className="underline text-xs" onClick={onClose} aria-label="Close">Close</button>
				</div>
				<div>{children}</div>
			</div>
		</div>
	);
}


