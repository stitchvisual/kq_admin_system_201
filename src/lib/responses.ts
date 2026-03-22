import { NextResponse } from "next/server";

export class ApiResponse {
  static success<T>(data: T, message?: string) {
    return NextResponse.json({ success: true, data, message });
  }

  static created<T>(data: T, message?: string) {
    return NextResponse.json(
      { success: true, data, message },
      { status: 201 }
    );
  }

  static error(
    message: string,
    status = 400,
    code?: string,
    details?: unknown
  ) {
    return NextResponse.json(
      { success: false, error: { message, code, details } },
      { status }
    );
  }

  static unknownError(error: unknown, context?: string) {
    // Log detailed error information for debugging
    const errorDetails = {
      context: context || 'API Request',
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    };
    console.error('API Error:', errorDetails);

    // In development, return detailed error information
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: error instanceof Error ? error.message : 'Unknown error',
            details: errorDetails,
          },
        },
        { status: 500 }
      );
    }

    // In production, return generic message
    return NextResponse.json(
      { success: false, error: { message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
