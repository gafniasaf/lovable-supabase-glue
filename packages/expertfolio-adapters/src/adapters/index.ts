
// Simple adapters for development
export const adminAuditLogsAdapter = {
  getLogs: async () => ({ logs: [], total: 0 }),
  getLogById: async (id: string) => ({ id, message: 'Sample log' })
};

export const filesAdapter = {
  finalizeUpload: async () => ({ success: true }),
  getDownloadUrl: async () => ({ url: '#' })
};
