import { NextRequest } from 'next/server';
import { clientsRepository } from '@/repositories/clients.repository';
import { ApiResponse } from '@/lib/responses';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const relatedCounts = await clientsRepository.getRelatedCounts(id);

    return ApiResponse.success(relatedCounts);
  } catch (error) {
    console.error('Error fetching related counts:', error);
    return ApiResponse.error('Failed to fetch related counts');
  }
}