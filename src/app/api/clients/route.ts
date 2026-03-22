import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/responses";
import { clientsService } from "@/services/clients.service";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const search = request.nextUrl.searchParams.get("search") ?? undefined;
    const page = Number(request.nextUrl.searchParams.get("page") ?? "1");
    const limit = Number(request.nextUrl.searchParams.get("limit") ?? "10");
    
    const [clients, total] = await Promise.all([
      clientsService.list(search, page, limit),
      clientsService.count(search),
    ]);

    return NextResponse.json({
      success: true,
      data: clients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "UnauthorizedError") {
      return ApiResponse.error(error.message, 401);
    }
    return ApiResponse.unknownError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const client = await clientsService.create(body);
    return ApiResponse.created(client, "Client created successfully");
  } catch (error) {
    if (error instanceof Error && error.name === "ValidationError") {
      return ApiResponse.error(error.message, 400, "VALIDATION_ERROR");
    }
    if (error instanceof Error && error.name === "DuplicateError") {
      return ApiResponse.error(error.message, 409, "DUPLICATE");
    }
    if (error instanceof Error && error.name === "UnauthorizedError") {
      return ApiResponse.error(error.message, 401);
    }
    return ApiResponse.unknownError(error);
  }
}
