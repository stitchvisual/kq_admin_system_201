// Looking at this file to understand rate format
import { NextRequest } from 'next/server';
import { ApiResponse } from '@/lib/responses';
import { invoicesService } from '@/services/invoices.service';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    
    const startDate = request.nextUrl.searchParams.get('startDate');
    const endDate = request.nextUrl.searchParams.get('endDate');
    
    if (!startDate || !endDate) {
      return ApiResponse.error('Start date and end date are required', 400, 'VALIDATION_ERROR');
    }
    
    const sessions = await invoicesService.getUninvoicedSessions(startDate, endDate);
    return ApiResponse.success(sessions);
  } catch (error) {
    if (error instanceof Error && error.name === 'UnauthorizedError') {
      return ApiResponse.error(error.message, 401);
    }
    return ApiResponse.unknownError(error);
  }
}