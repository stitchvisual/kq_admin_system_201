import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/responses";
import { appointmentsService } from "@/services/appointments.service";
import { requireAdmin } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const appointment = await appointmentsService.getById(id);
    return ApiResponse.success(appointment);
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
    
    const appointment = await appointmentsService.update(id, body);
    return ApiResponse.success(appointment, "Appointment updated successfully");
  } catch (error) {
    if (error instanceof Error && error.name === "NotFoundError") {
      return ApiResponse.error(error.message, 404, "NOT_FOUND");
    }
    if (error instanceof Error && error.name === "ValidationError") {
      return ApiResponse.error(error.message, 400, "VALIDATION_ERROR");
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
    await appointmentsService.delete(id);
    return ApiResponse.success({ success: true }, "Appointment cancelled successfully");
  } catch (error) {
    if (error instanceof Error && error.name === "NotFoundError") {
      return ApiResponse.error(error.message, 404, "NOT_FOUND");
    }
    if (error instanceof Error && error.name === "ValidationError") {
      return ApiResponse.error(error.message, 400, "VALIDATION_ERROR");
    }
    if (error instanceof Error && error.name === "UnauthorizedError") {
      return ApiResponse.error(error.message, 401);
    }
    return ApiResponse.unknownError(error);
  }
}