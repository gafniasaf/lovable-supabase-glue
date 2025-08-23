"use client";
import { useEffect, useState } from "react";
import { useNotificationsPoll } from "@/lib/hooks/useNotificationsPoll";

export default function NotificationsBellClient({ initialUnread = 0 }: { initialUnread?: number }) {
	const [unread, setUnread] = useState<number>(initialUnread);
	useNotificationsPoll(15000, (count) => setUnread(count));

	useEffect(() => {
		function onUpdated() {
			setTimeout(async () => {
				try {
					// Skip on public auth pages to avoid unnecessary calls before login
					const path = (typeof window !== 'undefined' && window.location?.pathname) ? window.location.pathname : '';
					if (path.startsWith('/login') || path.startsWith('/auth')) return;
					// Skip if no Supabase session yet
					const hasSession = (() => {
						try {
							const ck = typeof document !== 'undefined' ? (document.cookie || '') : '';
							if (/sb-[^=]+=/.test(ck)) return true;
							const keys = Object.keys(localStorage || {});
							return keys.some(k => k.startsWith('sb-') && k.endsWith('-auth-token') && !!localStorage.getItem(k));
						} catch { return false; }
					})();
					if (!hasSession) return;
					const origin = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : '';
					const res = await fetch(`${origin}/api/notifications`, { cache: 'no-store' });
					const arr = await res.json().catch(() => []);
					const cnt = Array.isArray(arr) ? arr.filter((n: any) => !n.read_at).length : 0;
					setUnread(cnt);
				} catch {}
			}, 0);
		}
		window.addEventListener('notifications:updated', onUpdated as any);
		return () => window.removeEventListener('notifications:updated', onUpdated as any);
	}, []);

	const bumpClass = unread > 0 ? 'animate-pulse' : '';
	return (
		<span className="inline-flex items-center gap-2">
			<span className={bumpClass}>🔔</span>
			<span className="ml-1 text-xs">{unread}</span>
			<span className="ml-2 inline-flex items-center gap-1 text-[10px] text-gray-500">
				<span className="w-2 h-2 rounded-full bg-gray-400" title="Polling" />
				<span>Polling</span>
			</span>
		</span>
	);
}


