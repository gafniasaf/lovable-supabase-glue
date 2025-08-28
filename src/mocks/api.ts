
// Mock API handlers for development
import { getAuditLogs, getAuditLogById } from '../api/admin/audit-logs';
import { supabase } from '@/integrations/supabase/client';

export const mockApiHandlers = {
  async handleAuditLogsRequest(url: string): Promise<Response> {
    try {
      const urlObj = new URL(url, window.location.origin);
      const params = urlObj.searchParams;
      
      const result = await getAuditLogs(params);
      
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Total-Count': result.total.toString()
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          statusCode: 500
        }
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },

  async handleAuditLogByIdRequest(url: string): Promise<Response> {
    try {
      const urlObj = new URL(url, window.location.origin);
      const pathParts = urlObj.pathname.split('/');
      const id = pathParts[pathParts.length - 1];
      
      if (!id) {
        return new Response(JSON.stringify({
          error: {
            code: 'BAD_REQUEST',
            message: 'ID is required',
            statusCode: 400
          }
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const result = await getAuditLogById(id);
      
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      const status = error instanceof Error && error.message === 'Audit log not found' ? 404 : 500;
      return new Response(JSON.stringify({
        error: {
          code: status === 404 ? 'NOT_FOUND' : 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          statusCode: status
        }
      }), {
        status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },

  async handleFilesFinalizeRequest(body: any): Promise<Response> {
    try {
      if (!body?.key || typeof body?.size_bytes !== 'number') {
        return new Response(JSON.stringify({
          error: {
            code: 'BAD_REQUEST',
            message: 'key and size_bytes are required',
            statusCode: 400
          }
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Mock successful finalization
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          statusCode: 500
        }
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },

  async handleFilesDownloadUrlRequest(url: string): Promise<Response> {
    try {
      const urlObj = new URL(url, window.location.origin);
      const id = urlObj.searchParams.get('id');
      
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
        });
      }

      // Generate a signed URL for the file
      const { data, error } = await supabase.storage
        .from('expertfolio-files')
        .createSignedUrl(id, 3600);

      if (error) {
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
          });
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
        });
      }

      const filename = id.split('/').pop() || id;
      const ext = filename.split('.').pop()?.toLowerCase();
      let content_type = 'application/octet-stream';
      
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
        };
        content_type = mimeTypes[ext] || content_type;
      }

      return new Response(JSON.stringify({
        url: data.signedUrl,
        filename,
        content_type
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          statusCode: 500
        }
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};
