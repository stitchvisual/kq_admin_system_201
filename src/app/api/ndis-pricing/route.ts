import { NextRequest } from 'next/server';
import { ApiResponse } from '@/lib/responses';
import { requireAdmin } from '@/lib/auth';
import { db } from '@/db';
import { ndisPricing } from '@/db/schema';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    
    const items = await db
      .select()
      .from(ndisPricing)
      .orderBy(ndisPricing.support_item_code);
    
    return ApiResponse.success(items);
  } catch (error) {
    if (error instanceof Error && error.name === 'UnauthorizedError') {
      return ApiResponse.error(error.message, 401);
    }
    return ApiResponse.unknownError(error);
  }
}
