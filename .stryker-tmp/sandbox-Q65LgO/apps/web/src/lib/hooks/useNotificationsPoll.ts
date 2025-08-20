// @ts-nocheck
"use client";
import { useEffect } from "react";
import { fireToast } from "@/components/ui/Toast";

export function useNotificationsPoll(intervalMs: number = 15000, onUpdate?: (unreadCount: number, items: any[]) => void) {
	useEffect(() => {
		let timer: number | null = null;
		async function tick() {
			try {
				const base = process.env.NEXT_PUBLIC_BASE_URL || '';
				const res = await fetch(`${base}/api/notifications`, { cache: 'no-store' });
				if (res.ok) {
					const json = await res.json().catch(() => []);
					const arr = Array.isArray(json) ? json : [];
					const unread = arr.filter((n: any) => !n.read_at).length;
					if (unread > 0) {
						// simplistic: announce presence of any unread items
						fireToast('You have unread notifications');
					}
					if (onUpdate) onUpdate(unread, arr);
				}
			} finally {
				timer = window.setTimeout(tick, intervalMs);
			}
		}
		timer = window.setTimeout(tick, intervalMs);
		return () => { if (timer) window.clearTimeout(timer); };
	}, [intervalMs, onUpdate]);
}


