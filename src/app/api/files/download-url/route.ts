
import { NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { 
          error: { 
            code: 'BAD_REQUEST', 
            message: 'id parameter is required',
            statusCode: 400
          } 
        }, 
        { status: 400 }
      );
    }

    // Generate a signed URL for the file
    const { data, error } = await supabase.storage
      .from('expertfolio-files')
      .createSignedUrl(id, 3600); // 1 hour expiry

    if (error) {
      console.error('Storage error:', error);
      
      // Check if it's a not found error
      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        return NextResponse.json(
          { 
            error: { 
              code: 'NOT_FOUND', 
              message: 'File not found',
              statusCode: 404
            } 
          }, 
          { status: 404 }
        );
      }

      return NextResponse.json(
        { 
          error: { 
            code: 'STORAGE_ERROR', 
            message: 'Failed to generate download URL',
            statusCode: 500
          } 
        }, 
        { status: 500 }
      );
    }

    // Extract filename from the id (assuming it contains the filename)
    const filename = id.split('/').pop() || id;
    
    // Try to determine content type from filename extension
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

    return NextResponse.json(
      { 
        url: data.signedUrl, 
        filename, 
        content_type 
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (err: any) {
    console.error('API error:', err);
    return NextResponse.json(
      { 
        error: { 
          code: 'INTERNAL_ERROR', 
          message: err?.message || 'Unexpected error',
          statusCode: 500
        } 
      }, 
      { status: 500 }
    );
  }
}
