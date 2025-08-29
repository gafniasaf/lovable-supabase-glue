import React from 'react';

export type FileItem = {
  id: string;
  createdAt: string;
  ownerId?: string;
  name: string;
  mime: string;
  sizeBytes: number;
  path: string;
};

export type Pagination = { page: number; pageSize: number; total: number; query?: string };

export type FilesPageProps = {
  items: FileItem[];
  pagination: Pagination;
  status: 'idle' | 'loading' | 'error';
  onSearch: (q: string) => void;
  onPageChange: (p: number) => void;
  onRetry?: () => void;
};

export function FilesPage({ items, pagination, status }: FilesPageProps) {
  if (status === 'loading') return <div>Loading files…</div>;
  if (status === 'error') return <div role="alert">Failed to load files</div>;

  return (
    <div>
      <h2>Files</h2>
      <ul>
        {items.map((f) => (
          <li key={f.id}>
            <strong>{f.name}</strong> — {(f.sizeBytes / 1024).toFixed(1)} KB — {f.mime}
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 12 }}>Page {pagination.page}</div>
    </div>
  );
}


