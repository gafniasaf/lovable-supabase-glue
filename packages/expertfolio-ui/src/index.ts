export type AuditLog = {
  id: string;
  createdAt: string;
  actorId?: string;
  action: 'LOGIN' | 'UPLOAD' | 'DELETE' | 'UPDATE';
  target?: string;
  metadata?: Record<string, unknown>;
};

export type FileItem = {
  id: string;
  createdAt: string;
  ownerId?: string;
  name: string;
  mime: string;
  sizeBytes: number;
  path: string;
};

export {};
