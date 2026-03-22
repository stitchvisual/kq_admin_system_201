import { NextRequest } from 'next/server';
import { ApiResponse } from '@/lib/responses';
import { appointmentsService } from '@/services/appointments.service';
import { requireAdmin } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    
    const { id } = await params;
    const body = await request.json();
    const { notes } = body;
    
    const appointment = await appointmentsService.complete(id, notes);
    
    return ApiResponse.success(
      appointment,
      'Appointment marked as complete'
    );
  } catch (error) {
    if (error instanceof Error && error.name === 'NotFoundError') {
      return ApiResponse.error(error.message, 404);
    }
    if (error instanceof Error && error.name === 'ValidationError') {
      return ApiResponse.error(error.message, 400, 'VALIDATION_ERROR');
    }
    if (error instanceof Error && error.name === 'UnauthorizedError') {
      return ApiResponse.error(error.message, 401);
    }
    return ApiResponse.unknownError(error);
  }
}
