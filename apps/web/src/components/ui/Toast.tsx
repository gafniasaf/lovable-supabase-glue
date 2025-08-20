"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";

type ToastItem = { id: string; title: string; kind?: "success" | "error" | "info" };

export function useToasts() {
	const [toasts, setToasts] = useState<ToastItem[]>([]);
	const dismiss = useCallback((id: string) => setToasts(prev => prev.filter(t => t.id !== id)), []);
	const push = useCallback((title: string, kind: ToastItem["kind"] = "info") => {
		const id = crypto.randomUUID();
		setToasts(prev => [...prev, { id, title, kind }]);
		return id;
	}, []);
	return { toasts, push, dismiss } as const;
}

export function ToastRegion({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: string) => void }) {
	return (
		<div className="fixed bottom-4 right-4 z-[1000] space-y-2" role="region" aria-live="polite" aria-label="Notifications">
			{toasts.map(t => <Toast key={t.id} item={t} onDismiss={onDismiss} />)}
		</div>
	);
}

function Toast({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
	const ref = useRef<number | null>(null);
	useEffect(() => {
		ref.current = window.setTimeout(() => onDismiss(item.id), 4000);
		return () => { if (ref.current) window.clearTimeout(ref.current); };
	}, [item.id, onDismiss]);
	const color = item.kind === "success" ? "bg-green-600" : item.kind === "error" ? "bg-red-600" : "bg-gray-900";
	return (
		<div className={["text-white px-3 py-2 rounded shadow", color].join(" ")}>
			<div className="flex items-center justify-between gap-4">
				<span>{item.title}</span>
				<button className="underline text-xs" onClick={() => onDismiss(item.id)} aria-label="Dismiss">Dismiss</button>
			</div>
		</div>
	);
}

export function fireToast(title: string, kind: ToastItem["kind"] = "info") {
	if (typeof window === "undefined") return;
	const ev = new CustomEvent("app:toast", { detail: { title, kind } });
	window.dispatchEvent(ev);
}


