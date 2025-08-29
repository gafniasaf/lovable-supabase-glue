import React from 'react';

type AppShellProps = {
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  children: React.ReactNode;
};

export function AppShell({ sidebar, header, children }: AppShellProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '100vh' }}>
      <aside style={{ borderRight: '1px solid #e5e7eb', padding: 16 }}>{sidebar}</aside>
      <main>
        <div style={{ borderBottom: '1px solid #e5e7eb', padding: 16 }}>{header}</div>
        <div style={{ padding: 16 }}>{children}</div>
      </main>
    </div>
  );
}


