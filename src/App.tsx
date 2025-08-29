import React from 'react';

import { supabase } from './integrations/supabase/client';
import { useEffect, useState } from 'react';

type AuditLog = {
  id: string;
  created_at: string;
  actor_id: string | null;
  action: string;
  target: string | null;
  metadata: Record<string, unknown>;
};

export function App(): JSX.Element {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .schema('ui_demo')
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setLogs((data as AuditLog[]) ?? []);
      });
  }, []);

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #0f172a 0%, #111827 100%)',
        color: '#e5e7eb',
        padding: '2rem'
      }}
    >
      <div style={{ maxWidth: 720, width: '100%', textAlign: 'center' }}>
        <h1 style={{ fontSize: 36, marginBottom: 12 }}>Expertfolio Console</h1>
        <p style={{ opacity: 0.9, marginBottom: 24 }}>
          Lovable UI/UX shell for the Expertfolio experience. This minimal build verifies the Vercel
          deployment pipeline from the root Vite app.
        </p>
        <div
          style={{
            display: 'inline-flex',
            gap: 12,
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <a
            href="https://github.com/gafniasaf/lovable-supabase-glue"
            target="_blank"
            rel="noreferrer"
            style={{
              background: '#1f2937',
              border: '1px solid #374151',
              padding: '10px 14px',
              borderRadius: 8,
              color: '#e5e7eb',
              textDecoration: 'none'
            }}
          >
            View Repository
          </a>
          <a
            href="/"
            style={{
              background: '#2563eb',
              border: '1px solid #1e40af',
              padding: '10px 14px',
              borderRadius: 8,
              color: '#e5e7eb',
              textDecoration: 'none'
            }}
          >
            Explore UI
          </a>
        </div>
        <div style={{ marginTop: 24, textAlign: 'left' }}>
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>Recent Audit Logs</h2>
          {error && <div style={{ color: '#fca5a5' }}>Error: {error}</div>}
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {logs.map((l) => (
              <li key={l.id} style={{ padding: '8px 0', borderBottom: '1px solid #374151' }}>
                <div style={{ fontSize: 14, opacity: 0.9 }}>{new Date(l.created_at).toLocaleString()}</div>
                <div style={{ fontSize: 16 }}>
                  <strong>{l.action}</strong>
                  {l.target ? ` on ${l.target}` : ''}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}

export default App;


