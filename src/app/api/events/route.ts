import { NextRequest, NextResponse } from "next/server";
import { eventsService } from "@/services/events.service";

// Public API - no auth required, only returns published events
export async function GET(request: NextRequest) {
  try {
    const limit = Number(request.nextUrl.searchParams.get("limit") ?? "10");
    const forHome = request.nextUrl.searchParams.get("home") === "true";

    const events = forHome
      ? await eventsService.getPublishedForHome(limit)
      : await eventsService.getPublishedUpcoming(limit);

    return NextResponse.json({
      success: true,
      data: events,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch events" } },
      { status: 500 }
    );
  }
}