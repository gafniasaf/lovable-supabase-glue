"use client";
import React, { useEffect, useState } from "react";
import { ToastRegion } from "@/components/ui/Toast";

type ToastItem = { id: string; title: string; kind?: "success" | "error" | "info" };

export default function ToastMount() {
	const [toasts, setToasts] = useState<ToastItem[]>([]);
	useEffect(() => {
		function onToast(e: any) {
			const id = crypto.randomUUID();
			setToasts(prev => [...prev, { id, title: e?.detail?.title ?? String(e?.detail ?? 'Done'), kind: e?.detail?.kind }]);
			window.setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
		}
		window.addEventListener('app:toast' as any, onToast);
		return () => window.removeEventListener('app:toast' as any, onToast);
	}, []);
	return <ToastRegion toasts={toasts} onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />;
}


