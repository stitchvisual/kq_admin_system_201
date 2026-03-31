import { NextRequest } from 'next/server';
import { ApiResponse } from '@/lib/responses';
import { invoicesService } from '@/services/invoices.service';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    
    const body = await request.json();
    const { client_id, due_date, notes, auto_email, appointment_ids } = body;
    
    if (!client_id) {
      return ApiResponse.error('Client ID is required', 400, 'VALIDATION_ERROR');
    }
    
    const invoice = await invoicesService.processBilling(client_id, {
      dueDate: due_date,
      notes,
      autoEmail: auto_email,
      appointmentIds: appointment_ids,
    });
    
    return ApiResponse.success(invoice, 'Invoice generated and issued successfully');
  } catch (error) {
    if (error instanceof Error && error.name === 'NotFoundError') {
      return ApiResponse.error(error.message, 404, 'NOT_FOUND');
    }
    if (error instanceof Error && error.name === 'ValidationError') {
      return ApiResponse.error(error.message, 400, 'VALIDATION_ERROR');
    }
    if (error instanceof Error && error.name === 'UnauthorizedError') {
      return ApiResponse.error(error.message, 401);
    }
    
    console.error('[Bill Now] Error:', error);
    return ApiResponse.unknownError(error);
  }
}