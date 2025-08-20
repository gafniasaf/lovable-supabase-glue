"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Provider = { id: string; name: string; jwks_url: string; domain: string; created_at?: string };

export default function ProvidersAdminPage() {
	const [providers, setProviders] = useState<Provider[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [name, setName] = useState<string>("");
	const [jwksUrl, setJwksUrl] = useState<string>("");
	const [domain, setDomain] = useState<string>("");
	const [health, setHealth] = useState<Record<string, string>>({});

	async function load() {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch(`/api/providers`, { cache: "no-store" });
			const json = await res.json();
			if (!res.ok) throw new Error(json?.error?.message || `HTTP ${res.status}`);
			setProviders(Array.isArray(json) ? json : []);
		} catch (e: any) {
			setError(String(e?.message || e));
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		load();
	}, []);

	async function createProvider(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		try {
			const res = await fetch(`/api/providers`, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ name, jwks_url: jwksUrl, domain })
			});
			const json = await res.json();
			if (!res.ok) throw new Error(json?.error?.message || `HTTP ${res.status}`);
			setName(""); setJwksUrl(""); setDomain("");
			await load();
		} catch (e: any) {
			setError(String(e?.message || e));
		}
	}

	async function pingHealth(id: string) {
		setHealth(h => ({ ...h, [id]: "…" }));
		try {
			const url = new URL(`/api/providers/health`, window.location.origin);
			url.searchParams.set("id", id);
			const res = await fetch(url.toString(), { cache: "no-store" });
			const json = await res.json().catch(() => ({}));
			setHealth(h => ({ ...h, [id]: res.ok ? (json?.ok ? "OK" : "WARN") : `HTTP ${res.status}` }));
		} catch {
			setHealth(h => ({ ...h, [id]: "ERR" }));
		}
	}

	return (
		<section className="p-6 space-y-6" aria-label="Providers">
			<h1 className="text-xl font-semibold">Providers</h1>
			<form className="space-y-3 max-w-xl" onSubmit={createProvider}>
				<div className="flex flex-col gap-1">
					<label className="text-sm">Name</label>
					<input className="border rounded px-2 py-1" value={name} onChange={e => setName(e.target.value)} required />
				</div>
				<div className="flex flex-col gap-1">
					<label className="text-sm">JWKS URL (https)</label>
					<input className="border rounded px-2 py-1" value={jwksUrl} onChange={e => setJwksUrl(e.target.value)} required />
				</div>
				<div className="flex flex-col gap-1">
					<label className="text-sm">Domain (https origin)</label>
					<input className="border rounded px-2 py-1" value={domain} onChange={e => setDomain(e.target.value)} required />
				</div>
				<div className="flex items-center gap-3">
					<button className="px-3 py-1 border rounded" type="submit">Create</button>
					{error ? <span className="text-red-600 text-sm">{error}</span> : null}
				</div>
			</form>
			<div className="space-y-2">
				<div className="text-sm text-gray-600">{loading ? "Loading…" : `${providers.length} provider(s)`}</div>
				<table className="min-w-full border text-sm">
					<thead>
						<tr className="bg-gray-50">
							<th className="border px-2 py-1 text-left">Name</th>
							<th className="border px-2 py-1 text-left">Domain</th>
							<th className="border px-2 py-1 text-left">JWKS URL</th>
							<th className="border px-2 py-1">Health</th>
							<th className="border px-2 py-1">Actions</th>
						</tr>
					</thead>
					<tbody>
						{providers.map(p => (
							<tr key={p.id}>
								<td className="border px-2 py-1"><Link className="underline" href={`/admin/providers/${p.id}`}>{p.name}</Link></td>
								<td className="border px-2 py-1">{p.domain}</td>
								<td className="border px-2 py-1 truncate max-w-[360px]" title={p.jwks_url}>{p.jwks_url}</td>
								<td className="border px-2 py-1 text-center">{health[p.id] ?? '-'}</td>
								<td className="border px-2 py-1 text-center">
									<button className="px-2 py-0.5 border rounded" onClick={() => pingHealth(p.id)}>Ping</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</section>
	);
}


