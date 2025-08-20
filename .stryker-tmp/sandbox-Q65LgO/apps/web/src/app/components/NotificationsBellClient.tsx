// @ts-nocheck
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
					const base = process.env.NEXT_PUBLIC_BASE_URL || '';
					const res = await fetch(`${base}/api/notifications`, { cache: 'no-store' });
					const arr = await res.json().catch(() => []);
					const cnt = Array.isArray(arr) ? arr.filter((n: any) => !n.read_at).length : 0;
					setUnread(cnt);
				} catch {}
			}, 0);
		}
		window.addEventListener('notifications:updated', onUpdated as any);
		return () => window.removeEventListener('notifications:updated', onUpdated as any);
	}, []);

	return (
		<span className="inline-flex items-center gap-1">
			<span>🔔</span>
			<span className="ml-1 text-xs">{unread}</span>
		</span>
	);
}


