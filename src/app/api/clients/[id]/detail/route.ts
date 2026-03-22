import { NextResponse } from 'next/server';
import { ApiResponse } from '@/lib/responses';
import { requireAdmin } from '@/lib/auth';
import { clientsRepository } from '@/repositories/clients.repository';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const detail = await clientsRepository.getClientDetail(id);

    if (!detail) {
      return ApiResponse.error('Client not found', 404);
    }

    return NextResponse.json({
      success: true,
      data: detail,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'UnauthorizedError') {
      return ApiResponse.error(error.message, 401);
    }
    return ApiResponse.unknownError(error);
  }
}