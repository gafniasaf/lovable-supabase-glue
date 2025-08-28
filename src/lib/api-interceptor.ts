
// API request interceptor for Vite development
import { mockApiHandlers } from '../mocks/api';

// Override fetch to intercept API calls
const originalFetch = window.fetch;

window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  
  // Handle API routes
  if (url.includes('/api/admin/audit-logs/') && !url.endsWith('/api/admin/audit-logs')) {
    // Individual audit log
    return mockApiHandlers.handleAuditLogByIdRequest(url);
  }
  
  if (url.includes('/api/admin/audit-logs')) {
    // Audit logs list
    return mockApiHandlers.handleAuditLogsRequest(url);
  }
  
  if (url.includes('/api/files/finalize')) {
    const body = init?.body ? JSON.parse(init.body as string) : {};
    return mockApiHandlers.handleFilesFinalizeRequest(body);
  }
  
  if (url.includes('/api/files/download-url')) {
    return mockApiHandlers.handleFilesDownloadUrlRequest(url);
  }
  
  // For all other requests, use the original fetch
  return originalFetch(input, init);
};

export {}; // Make this a module
