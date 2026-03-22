import { NextRequest } from 'next/server';
import { ApiResponse } from '@/lib/responses';
import { invoicesService } from '@/services/invoices.service';
import { requireAdmin } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const invoice = await invoicesService.issueInvoice(id);
    return ApiResponse.success(invoice, 'Invoice issued successfully');
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
    return ApiResponse.unknownError(error);
  }
}