
import { apiHandlers } from '../api/server'

// Mock API server for development
const originalFetch = window.fetch

window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
  const method = init?.method || 'GET'

  // Only intercept API calls in development
  if (import.meta.env.DEV && url.startsWith('/api/')) {
    console.log(`[API Interceptor] ${method} ${url}`)
    
    try {
      // Route to appropriate handler
      if (url.match(/^\/api\/admin\/audit-logs\/[^/]+$/)) {
        const id = url.split('/').pop()!
        return await apiHandlers.getAuditLogById(new Request(url, init), id)
      } else if (url.startsWith('/api/admin/audit-logs')) {
        return await apiHandlers.getAuditLogs(new Request(url, init))
      } else if (url.startsWith('/api/files/finalize')) {
        return await apiHandlers.finalizeFile(new Request(url, init))
      } else if (url.startsWith('/api/files/download-url')) {
        return await apiHandlers.getDownloadUrl(new Request(url, init))
      }
    } catch (error) {
      console.error('[API Interceptor] Error:', error)
      return new Response(JSON.stringify({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'API interceptor error',
          statusCode: 500
        }
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }

  // Fall back to original fetch for non-API calls
  return originalFetch(input, init)
}
