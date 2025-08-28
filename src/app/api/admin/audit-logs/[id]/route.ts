
import { NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { 
          error: { 
            code: 'BAD_REQUEST', 
            message: 'Audit log ID is required',
            statusCode: 400
          } 
        }, 
        { status: 400 }
      );
    }

    const { data: log, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return NextResponse.json(
          { 
            error: { 
              code: 'NOT_FOUND', 
              message: 'Audit log not found',
              statusCode: 404
            } 
          }, 
          { status: 404 }
        );
      }

      console.error('Supabase error:', error);
      return NextResponse.json(
        { 
          error: { 
            code: 'DATABASE_ERROR', 
            message: 'Failed to fetch audit log',
            statusCode: 500
          } 
        }, 
        { status: 500 }
      );
    }

    return NextResponse.json(log, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

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
