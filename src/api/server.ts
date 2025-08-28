import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ukeqjiattiaokdqjqncf.supabase.co'
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrZXFqaWF0dGlhb2tkcWpxbmNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwOTI3NzIsImV4cCI6MjA3MDY2ODc3Mn0.sYYDUgwCt4X4k9ME6a_G2R3BA6GftI3WAcWVqBv2h2E'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Utility function to parse query parameters
const parseQuery = (url: string) => {
  const urlObj = new URL(url, 'http://localhost')
  const params = new URLSearchParams(urlObj.search)
  return {
    limit: Math.min(Math.max(parseInt(params.get('limit') || '20'), 1), 100),
    offset: Math.max(parseInt(params.get('offset') || '0'), 0),
    sortBy: params.get('sortBy') || 'created_at',
    sortOrder: (params.get('sortOrder') as 'asc' | 'desc') || 'desc',
    actor_id: params.get('actor_id') || undefined,
    action: params.get('action') || undefined,
    entity_type: params.get('entity_type') || undefined,
    from_date: params.get('from_date') || undefined,
    to_date: params.get('to_date') || undefined,
    id: params.get('id') || undefined
  }
}

// API handlers
export const apiHandlers = {
  // GET /api/admin/audit-logs
  async getAuditLogs(request: Request): Promise<Response> {
    try {
      const query = parseQuery(request.url)
      
      let supabaseQuery = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .order(query.sortBy, { ascending: query.sortOrder === 'asc' })
        .range(query.offset, query.offset + query.limit - 1)

      if (query.actor_id) {
        supabaseQuery = supabaseQuery.eq('actor_id', query.actor_id)
      }
      if (query.action) {
        supabaseQuery = supabaseQuery.eq('action', query.action)
      }
      if (query.entity_type) {
        supabaseQuery = supabaseQuery.eq('entity_type', query.entity_type)
      }
      if (query.from_date) {
        supabaseQuery = supabaseQuery.gte('created_at', query.from_date)
      }
      if (query.to_date) {
        supabaseQuery = supabaseQuery.lte('created_at', query.to_date)
      }

      const { data, error, count } = await supabaseQuery

      if (error) {
        console.error('Supabase error:', error)
        return new Response(JSON.stringify({
          error: {
            code: 'DATABASE_ERROR',
            message: error.message,
            statusCode: 500
          }
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({
        logs: data || [],
        total: count || 0,
        limit: query.limit,
        offset: query.offset
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'x-total-count': (count || 0).toString()
        }
      })
    } catch (err: any) {
      console.error('API error:', err)
      return new Response(JSON.stringify({
        error: {
          code: 'INTERNAL_ERROR',
          message: err?.message || 'Unexpected error',
          statusCode: 500
        }
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  },

  // GET /api/admin/audit-logs/[id]
  async getAuditLogById(request: Request, id: string): Promise<Response> {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return new Response(JSON.stringify({
            error: {
              code: 'NOT_FOUND',
              message: 'Audit log not found',
              statusCode: 404
            }
          }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          })
        }

        console.error('Supabase error:', error)
        return new Response(JSON.stringify({
          error: {
            code: 'DATABASE_ERROR',
            message: error.message,
            statusCode: 500
          }
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (err: any) {
      console.error('API error:', err)
      return new Response(JSON.stringify({
        error: {
          code: 'INTERNAL_ERROR',
          message: err?.message || 'Unexpected error',
          statusCode: 500
        }
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  },

  // POST /api/files/finalize
  async finalizeFile(request: Request): Promise<Response> {
    try {
      const body = await request.json()
      const { key, size_bytes } = body

      if (!key || typeof size_bytes !== 'number') {
        return new Response(JSON.stringify({
          error: {
            code: 'BAD_REQUEST',
            message: 'key and size_bytes are required',
            statusCode: 400
          }
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // In a real implementation, you might want to verify the file exists in storage
      // For now, we'll just return success
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (err: any) {
      console.error('API error:', err)
      return new Response(JSON.stringify({
        error: {
          code: 'INTERNAL_ERROR',
          message: err?.message || 'Unexpected error',
          statusCode: 500
        }
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  },

  // GET /api/files/download-url
  async getDownloadUrl(request: Request): Promise<Response> {
    try {
      const query = parseQuery(request.url)
      const id = query.id

      if (!id) {
        return new Response(JSON.stringify({
          error: {
            code: 'BAD_REQUEST',
            message: 'id parameter is required',
            statusCode: 400
          }
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const { data, error } = await supabase.storage
        .from('expertfolio-files')
        .createSignedUrl(id, 3600)

      if (error) {
        console.error('Storage error:', error)
        
        if (error.message.includes('not found') || error.message.includes('does not exist')) {
          return new Response(JSON.stringify({
            error: {
              code: 'NOT_FOUND',
              message: 'File not found',
              statusCode: 404
            }
          }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          })
        }

        return new Response(JSON.stringify({
          error: {
            code: 'STORAGE_ERROR',
            message: 'Failed to generate download URL',
            statusCode: 500
          }
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const filename = id.split('/').pop() || id
      const ext = filename.split('.').pop()?.toLowerCase()
      let content_type = 'application/octet-stream'
      
      if (ext) {
        const mimeTypes: Record<string, string> = {
          'pdf': 'application/pdf',
          'txt': 'text/plain',
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'gif': 'image/gif',
          'doc': 'application/msword',
          'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }
        content_type = mimeTypes[ext] || content_type
      }

      return new Response(JSON.stringify({
        url: data.signedUrl,
        filename,
        content_type
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (err: any) {
      console.error('API error:', err)
      return new Response(JSON.stringify({
        error: {
          code: 'INTERNAL_ERROR',
          message: err?.message || 'Unexpected error',
          statusCode: 500
        }
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
}
