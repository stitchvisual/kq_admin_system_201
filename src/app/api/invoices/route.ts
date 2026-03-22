import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/lib/responses';
import { invoicesService } from '@/services/invoices.service';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const status = request.nextUrl.searchParams.get('status') ?? undefined;
    const page = Number(request.nextUrl.searchParams.get('page') ?? '1');
    const limit = Number(request.nextUrl.searchParams.get('limit') ?? '10');

    const [invoices, total] = await Promise.all([
      invoicesService.list(status, page, limit),
      invoicesService.count(status),
    ]);

    return NextResponse.json({
      success: true,
      data: invoices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'UnauthorizedError') {
      return ApiResponse.error(error.message, 401);
    }
    return ApiResponse.unknownError(error);
  }
}
