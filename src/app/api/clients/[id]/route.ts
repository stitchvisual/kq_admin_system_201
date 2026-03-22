import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/responses";
import { clientsService } from "@/services/clients.service";
import { requireAdmin } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const client = await clientsService.getById(id);
    return ApiResponse.success(client);
  } catch (error) {
    if (error instanceof Error && error.name === "NotFoundError") {
      return ApiResponse.error(error.message, 404, "NOT_FOUND");
    }
    if (error instanceof Error && error.name === "UnauthorizedError") {
      return ApiResponse.error(error.message, 401);
    }
    return ApiResponse.unknownError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    
    // Try to parse JSON body, handle empty body
    let body;
    try {
      const text = await request.text();
      body = text ? JSON.parse(text) : {};
    } catch (e) {
      return ApiResponse.error("Invalid JSON body", 400, "INVALID_JSON");
    }
    
    const client = await clientsService.update(id, body);
    return ApiResponse.success(client, "Client updated successfully");
  } catch (error) {
    if (error instanceof Error && error.name === "NotFoundError") {
      return ApiResponse.error(error.message, 404, "NOT_FOUND");
    }
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    await clientsService.delete(id);
    return ApiResponse.success({ success: true }, "Client deleted successfully");
  } catch (error) {
    if (error instanceof Error && error.name === "NotFoundError") {
      return ApiResponse.error(error.message, 404, "NOT_FOUND");
    }
    if (error instanceof Error && error.name === "UnauthorizedError") {
      return ApiResponse.error(error.message, 401);
    }
    return ApiResponse.unknownError(error);
  }
}
