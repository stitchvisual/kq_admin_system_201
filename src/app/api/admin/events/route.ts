import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/responses";
import { eventsService } from "@/services/events.service";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const search = request.nextUrl.searchParams.get("search") ?? undefined;
    const page = Number(request.nextUrl.searchParams.get("page") ?? "1");
    const limit = Number(request.nextUrl.searchParams.get("limit") ?? "50");
    const publishedOnly = request.nextUrl.searchParams.get("published") === "true";
    const upcomingOnly = request.nextUrl.searchParams.get("upcoming") === "true";

    const [events, total] = await Promise.all([
      eventsService.list({ search, page, limit, publishedOnly, upcomingOnly }),
      eventsService.count({ search, publishedOnly }),
    ]);

    return NextResponse.json({
      success: true,
      data: events,
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
    
    // Parse the event_date string to a Date object
    const eventData = {
      ...body,
      event_date: body.event_date ? new Date(body.event_date) : undefined,
    };
    
    const event = await eventsService.create(eventData);
    return ApiResponse.created(event, "Event created successfully");
  } catch (error) {
    if (error instanceof Error && error.name === "ValidationError") {
      return ApiResponse.error(error.message, 400, "VALIDATION_ERROR");
    }
    if (error instanceof Error && error.name === "UnauthorizedError") {
      return ApiResponse.error(error.message, 401);
    }
    return ApiResponse.unknownError(error);
  }
}
