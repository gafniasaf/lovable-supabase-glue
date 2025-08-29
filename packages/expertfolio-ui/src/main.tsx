import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppShell } from './components/AppShell';
import { AuditLogsPage } from './pages/AuditLogsPage';

const rootEl = document.getElementById('root')!;
const root = createRoot(rootEl);

root.render(
  <React.StrictMode>
    <AppShell header={<div>Expertfolio UI Sandbox</div>} sidebar={<div>Sidebar</div>}>
      <AuditLogsPage
        items={[
          { id: '1', createdAt: new Date().toISOString(), action: 'UPLOAD', target: 'user:1' },
        ]}
        pagination={{ page: 1, pageSize: 10, total: 1 }}
        status="idle"
        onSearch={() => {}}
        onPageChange={() => {}}
      />
    </AppShell>
  </React.StrictMode>
);


