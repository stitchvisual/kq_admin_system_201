import { NextRequest } from 'next/server';
import { ApiResponse } from '@/lib/responses';
import { invoicesService } from '@/services/invoices.service';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    
    const body = await request.json();
    const { client_id, sessions, clients, due_date, notes } = body;
    
    // Handle bulk generation (multiple clients)
    if (clients && Array.isArray(clients)) {
      const invoices = await invoicesService.generateAllInvoices({
        clients,
        due_date,
        notes,
      });
      
      return ApiResponse.success(
        invoices,
        `${invoices.length} invoice(s) generated successfully`
      );
    }
    
    // Handle single client generation
    if (client_id && sessions && Array.isArray(sessions)) {
      const invoice = await invoicesService.generateInvoice({
        client_id,
        sessions,
        due_date,
        notes,
      });
      
      return ApiResponse.success(invoice, 'Invoice generated successfully');
    }
    
    return ApiResponse.error(
      'Invalid request. Provide either (client_id + sessions) or (clients array)',
      400,
      'VALIDATION_ERROR'
    );
  } catch (error) {
    // Log full error details for debugging
    console.error('Invoice generation error:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof Error && error.name === 'ValidationError') {
      return ApiResponse.error(error.message, 400, 'VALIDATION_ERROR');
    }
    if (error instanceof Error && error.name === 'UnauthorizedError') {
      return ApiResponse.error(error.message, 401);
    }
    
    // Include error details in development for easier debugging
    if (process.env.NODE_ENV === 'development' && error instanceof Error) {
      return ApiResponse.error(
        error.message,
        500,
        'INTERNAL_ERROR',
        error.stack
      );
    }
    
    return ApiResponse.unknownError(error);
  }
}
