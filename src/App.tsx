import React from 'react';

export function App(): JSX.Element {
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
      </div>
    </main>
  );
}

export default App;


