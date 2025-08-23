"use client";
import { useEffect, useRef } from "react";
import { fireToast } from "@/components/ui/Toast";

export function useNotificationsPoll(intervalMs: number = 15000, onUpdate?: (unreadCount: number, items: any[]) => void) {
	useEffect(() => {
		let timer: number | null = null;
		let mounted = true;
		const lastUnreadRef = { current: -1 } as { current: number };
		async function tick() {
			try {
				const origin = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : '';
				const res = await fetch(`${origin}/api/notifications`, { cache: 'no-store' });
				if (res.ok) {
					const json = await res.json().catch(() => []);
					const arr = Array.isArray(json) ? json : [];
					const unread = arr.filter((n: any) => !n.read_at).length;
					const mute = (() => { try { return localStorage.getItem('notifications.muteToasts') === '1'; } catch { return false; } })();
					if (!mute && unread > 0 && unread > (lastUnreadRef.current < 0 ? 0 : lastUnreadRef.current)) {
						// Only toast when unread increases compared to last observed count
						fireToast('You have unread notifications');
					}
					lastUnreadRef.current = unread;
					if (onUpdate) onUpdate(unread, arr);
				}
			} finally {
				if (mounted) timer = window.setTimeout(tick, intervalMs);
			}
		}
		timer = window.setTimeout(tick, intervalMs);
		return () => { mounted = false; if (timer) window.clearTimeout(timer); };
	}, [intervalMs, onUpdate]);
}


