"use client";
import { useState } from "react";

type Step = 'exchange'|'context'|'progress'|'grade'|'ckpt-save'|'ckpt-load';

export default function ConformancePage() {
	const [token, setToken] = useState<string>("");
	const [runtimeToken, setRuntimeToken] = useState<string>("");
	const [status, setStatus] = useState<Record<Step,string>>({} as any);
	const [pct, setPct] = useState<number>(25);
	const [topic, setTopic] = useState<string>("conformance");
	const [score, setScore] = useState<number>(85);
	const [max, setMax] = useState<number>(100);
	const [ckey, setCkey] = useState<string>("adaptive-state");
	const [cstate, setCstate] = useState<string>("{\"ok\":true}");

	async function doExchange() {
		setStatus(s => ({ ...s, exchange: '…' }));
		try {
			const res = await fetch('/api/runtime/auth/exchange', { method:'POST', headers:{ 'content-type':'application/json' }, body: JSON.stringify({ token }) });
			const json = await res.json();
			if (!res.ok) throw new Error(json?.error?.message || `HTTP ${res.status}`);
			setRuntimeToken(json.runtimeToken);
			setStatus(s => ({ ...s, exchange: 'OK' }));
		} catch (e: any) { setStatus(s => ({ ...s, exchange: String(e?.message || e) })); }
	}

	async function call(path: string, init?: RequestInit) {
		const res = await fetch(path, init);
		const text = await res.text();
		return { ok: res.ok, status: res.status, text };
	}

	async function doContext() {
		setStatus(s => ({ ...s, context: '…' }));
		try {
			const r = await call('/api/runtime/context', { headers:{ authorization: `Bearer ${runtimeToken}` }});
			setStatus(s => ({ ...s, context: r.ok ? 'OK' : `HTTP ${r.status}` }));
		} catch (e: any) { setStatus(s => ({ ...s, context: String(e?.message || e) })); }
	}

	async function doProgress() {
		setStatus(s => ({ ...s, progress: '…' }));
		try {
			const r = await call('/api/runtime/progress', { method:'POST', headers:{ 'content-type':'application/json', authorization: `Bearer ${runtimeToken}` }, body: JSON.stringify({ pct, topic }) });
			setStatus(s => ({ ...s, progress: r.ok ? 'OK' : `HTTP ${r.status}` }));
		} catch (e: any) { setStatus(s => ({ ...s, progress: String(e?.message || e) })); }
	}

	async function doGrade() {
		setStatus(s => ({ ...s, grade: '…' }));
		try {
			const r = await call('/api/runtime/grade', { method:'POST', headers:{ 'content-type':'application/json', authorization: `Bearer ${runtimeToken}` }, body: JSON.stringify({ score, max, passed: score >= Math.ceil(0.6*max), runtimeAttemptId: 'conformance' }) });
			setStatus(s => ({ ...s, grade: r.ok ? 'OK' : `HTTP ${r.status}` }));
		} catch (e: any) { setStatus(s => ({ ...s, grade: String(e?.message || e) })); }
	}

	async function doCkptSave() {
		setStatus(s => ({ ...s, 'ckpt-save': '…' }));
		try {
			const state = JSON.parse(cstate || '{}');
			const r = await call('/api/runtime/checkpoint/save', { method:'POST', headers:{ 'content-type':'application/json', authorization: `Bearer ${runtimeToken}` }, body: JSON.stringify({ key: ckey, state }) });
			setStatus(s => ({ ...s, 'ckpt-save': r.ok ? 'OK' : `HTTP ${r.status}` }));
		} catch (e: any) { setStatus(s => ({ ...s, 'ckpt-save': String(e?.message || e) })); }
	}

	async function doCkptLoad() {
		setStatus(s => ({ ...s, 'ckpt-load': '…' }));
		try {
			const r = await call(`/api/runtime/checkpoint/load?key=${encodeURIComponent(ckey)}`, { headers:{ authorization: `Bearer ${runtimeToken}` }});
			setStatus(s => ({ ...s, 'ckpt-load': r.ok ? 'OK' : `HTTP ${r.status}` }));
		} catch (e: any) { setStatus(s => ({ ...s, 'ckpt-load': String(e?.message || e) })); }
	}

	return (
		<section className="p-6 space-y-6" aria-label="Conformance">
			<h1 className="text-xl font-semibold">External Runtime Conformance</h1>
			<div className="space-y-3 max-w-2xl">
				<label className="block text-sm" htmlFor="conformance-launch-token">Launch token</label>
				<textarea id="conformance-launch-token" className="w-full border rounded p-2" rows={4} value={token} onChange={e => setToken(e.target.value)} placeholder="paste ?token here" />
				<div className="flex gap-2">
					<button className="px-3 py-1 border rounded" onClick={doExchange}>Exchange</button>
					<span className="text-sm">{status.exchange ?? '-'}</span>
				</div>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="space-y-2">
					<button className="px-3 py-1 border rounded" onClick={doContext}>Context</button>
					<div className="text-sm">{status.context ?? '-'}</div>
				</div>
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<input className="w-20 border rounded px-2 py-1" type="number" value={pct} onChange={e => setPct(parseInt(e.target.value || '0', 10))} />
						<input className="border rounded px-2 py-1" value={topic} onChange={e => setTopic(e.target.value)} />
						<button className="px-3 py-1 border rounded" onClick={doProgress}>Progress</button>
					</div>
					<div className="text-sm">{status.progress ?? '-'}</div>
				</div>
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<input className="w-20 border rounded px-2 py-1" type="number" value={score} onChange={e => setScore(parseInt(e.target.value || '0', 10))} />
						<input className="w-20 border rounded px-2 py-1" type="number" value={max} onChange={e => setMax(parseInt(e.target.value || '0', 10))} />
						<button className="px-3 py-1 border rounded" onClick={doGrade}>Grade</button>
					</div>
					<div className="text-sm">{status.grade ?? '-'}</div>
				</div>
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<input className="border rounded px-2 py-1" value={ckey} onChange={e => setCkey(e.target.value)} />
						<input className="flex-1 border rounded px-2 py-1" value={cstate} onChange={e => setCstate(e.target.value)} />
					</div>
					<div className="flex items-center gap-2">
						<button className="px-3 py-1 border rounded" onClick={doCkptSave}>Save</button>
						<button className="px-3 py-1 border rounded" onClick={doCkptLoad}>Load</button>
					</div>
					<div className="text-sm">save: {status['ckpt-save'] ?? '-'} | load: {status['ckpt-load'] ?? '-'}</div>
				</div>
			</div>
		</section>
	);
}


