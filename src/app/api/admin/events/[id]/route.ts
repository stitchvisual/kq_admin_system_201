import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/responses";
import { eventsService } from "@/services/events.service";
import { requireAdmin } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const event = await eventsService.getById(id);
    return NextResponse.json({ success: true, data: event });
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
    const body = await request.json();
    
    // Parse the event_date string to a Date object if provided
    const eventData = {
      ...body,
      event_date: body.event_date ? new Date(body.event_date) : undefined,
    };
    
    const event = await eventsService.update(id, eventData);
    return NextResponse.json({ success: true, data: event });
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
    await eventsService.delete(id);
    return NextResponse.json({ success: true });
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