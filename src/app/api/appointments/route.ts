import { NextRequest } from "next/server";
import { ApiResponse } from "@/lib/responses";
import { appointmentsService } from "@/services/appointments.service";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const today = request.nextUrl.searchParams.get("today");
    const stats = request.nextUrl.searchParams.get("stats");
    const weekStart = request.nextUrl.searchParams.get("weekStart") ?? undefined;

    // Return today's appointments
    if (today === "true") {
      const todaysAppointments = await appointmentsService.getTodaysAppointments();
      return ApiResponse.success(todaysAppointments);
    }

    // Return week stats
    if (stats === "true") {
      const weekStats = await appointmentsService.getWeekStats(weekStart);
      return ApiResponse.success(weekStats);
    }

    // Default: return appointments for the week
    const appointments = await appointmentsService.list(weekStart);
    return ApiResponse.success(appointments);
  } catch (error) {
    if (error instanceof Error && error.name === "UnauthorizedError") {
      return ApiResponse.error(error.message, 401);
    }
    if (error instanceof Error && error.name === "ValidationError") {
      return ApiResponse.error(error.message, 400, "VALIDATION_ERROR");
    }
    return ApiResponse.unknownError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return ApiResponse.error("Invalid or missing JSON body", 400, "INVALID_JSON");
    }
    if (!body || typeof body !== "object") {
      return ApiResponse.error("Request body must be an object", 400, "VALIDATION_ERROR");
    }
    const appointment = await appointmentsService.create(body as Record<string, unknown>);
    return ApiResponse.created(appointment, "Appointment created successfully");
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