import { NextRequest } from 'next/server';
import { ApiResponse } from '@/lib/responses';
import { appointmentsService } from '@/services/appointments.service';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    
    const uninvoiced = await appointmentsService.getUninvoiced();
    
    return ApiResponse.success(uninvoiced);
  } catch (error) {
    if (error instanceof Error && error.name === 'UnauthorizedError') {
      return ApiResponse.error(error.message, 401);
    }
    return ApiResponse.unknownError(error);
  }
}
