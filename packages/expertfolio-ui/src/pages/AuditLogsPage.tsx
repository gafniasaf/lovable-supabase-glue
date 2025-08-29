import React from 'react';

export type AuditLog = {
  id: string;
  createdAt: string;
  actorId?: string;
  action: 'LOGIN' | 'UPLOAD' | 'DELETE' | 'UPDATE';
  target?: string;
};

export type Pagination = { page: number; pageSize: number; total: number; query?: string };

export type AuditLogsPageProps = {
  items: AuditLog[];
  pagination: Pagination;
  status: 'idle' | 'loading' | 'error';
  onSearch: (q: string) => void;
  onPageChange: (p: number) => void;
  onRetry?: () => void;
};

export function AuditLogsPage({ items, pagination, status }: AuditLogsPageProps) {
  if (status === 'loading') return <div>Loading logs…</div>;
  if (status === 'error') return <div role="alert">Failed to load logs</div>;

  return (
    <div>
      <h2>Audit Logs</h2>
      <table>
        <thead>
          <tr>
            <th>When</th>
            <th>Action</th>
            <th>Target</th>
          </tr>
        </thead>
        <tbody>
          {items.map((l) => (
            <tr key={l.id}>
              <td>{new Date(l.createdAt).toLocaleString()}</td>
              <td>{l.action}</td>
              <td>{l.target}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 12 }}>Page {pagination.page}</div>
    </div>
  );
}


