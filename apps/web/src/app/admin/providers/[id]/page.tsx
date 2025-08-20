"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ProviderDetailPage() {
	const params = useParams() as { id: string };
	const id = params?.id;
	const [prov, setProv] = useState<any>(null);
	const [health, setHealth] = useState<string>("-");
	const [error, setError] = useState<string | null>(null);
	const [sending, setSending] = useState<boolean>(false);

	useEffect(() => {
		(async () => {
			try {
				const res = await fetch(`/api/providers`);
				const json = await res.json();
				const p = (Array.isArray(json) ? json : []).find((x: any) => x.id === id);
				setProv(p || null);
			} catch {}
		})();
	}, [id]);

	async function ping() {
		try {
			const url = new URL('/api/providers/health', window.location.origin);
			url.searchParams.set('id', id);
			const res = await fetch(url.toString());
			const json = await res.json().catch(() => ({}));
			setHealth(res.ok ? (json?.ok ? 'OK' : 'WARN') : `HTTP ${res.status}`);
		} catch { setHealth('ERR'); }
	}

	async function sendTestOutcome() {
		if (!prov) return;
		setSending(true); setError(null);
		try {
			// This is a client-only helper to call our outcomes endpoint with a dummy payload;
			// intended for quick path sanity (requires being signed-in as a teacher).
			const body = { courseId: prompt('courseId?') || '', userId: prompt('userId?') || '', event: { type: 'progress', pct: 1, topic: 'test' } };
			const res = await fetch(`/api/runtime/outcomes`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
			if (!res.ok) {
				const j = await res.json().catch(() => null);
				throw new Error(j?.error?.message || `HTTP ${res.status}`);
			}
			alert('Sent. Check outcomes list.');
		} catch (e: any) {
			setError(String(e?.message || e));
		} finally { setSending(false); }
	}

	return (
		<section className="p-6 space-y-4" aria-label="Provider">
			<h1 className="text-xl font-semibold">Provider</h1>
			{prov ? (
				<div className="space-y-2">
					<div>Name: {prov.name}</div>
					<div>Domain: {prov.domain}</div>
					<div>JWKS URL: <a className="underline" href={prov.jwks_url} target="_blank" rel="noreferrer">{prov.jwks_url}</a></div>
					<div className="flex gap-2 items-center">
						<button className="px-3 py-1 border rounded" onClick={ping}>Ping health</button>
						<span className="text-sm">{health}</span>
					</div>
					<div className="flex gap-2 items-center">
						<button className="px-3 py-1 border rounded" disabled={sending} onClick={sendTestOutcome}>Send test outcome</button>
						{error ? <span className="text-sm text-red-600">{error}</span> : null}
					</div>
				</div>
			) : <div>Loading…</div>}
		</section>
	);
}


