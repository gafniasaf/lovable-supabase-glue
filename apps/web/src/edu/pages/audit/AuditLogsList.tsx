"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type AuditLog = {
	id: string;
	event: string;
	created_at?: string;
};

export function AuditLogsList() {
	const [logs, setLogs] = useState<AuditLog[]>([]);
	const [loading, setLoading] = useState(true);
  const useMock = process.env.NEXT_PUBLIC_SUPABASE_USE_MOCK === '1' || typeof window === 'undefined';

	useEffect(() => {
		let isMounted = true;
		async function fetchLogs() {
			try {
				let data: any[] | null = null;
				let error: any = null;
				if (useMock) {
					data = [
						{ id: 'm1', event: 'Mock Login', created_at: new Date().toISOString() },
						{ id: 'm2', event: 'Mock View Course', created_at: new Date().toISOString() },
					];
				} else {
					const resp = await supabase
						.from("audit_logs")
						.select("id,event,created_at")
						.limit(50);
					data = resp.data;
					error = resp.error;
				}
				if (!isMounted) return;
				if (!error && Array.isArray(data)) {
					setLogs(data as AuditLog[]);
				}
			} finally {
				if (isMounted) setLoading(false);
			}
		}
		fetchLogs();
		return () => {
			isMounted = false;
		};
	}, []);

	return (
		<div>
			<h1>Audit Logs</h1>
			{loading ? (
				<p>Loading…</p>
			) : (
				<ul>
					{logs.map((log) => (
						<li key={log.id}>
							<span>{log.event}</span>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}


