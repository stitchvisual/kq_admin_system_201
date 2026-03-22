import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";

export async function middleware(request: NextRequest) {
  try {
    return await updateSession(request);
  } catch (error) {
    // Capture middleware errors
    Sentry.captureException(error, {
      tags: {
        middleware: true,
        path: request.nextUrl.pathname,
      },
      extra: {
        method: request.method,
        url: request.url,
        headers: Object.fromEntries(request.headers.entries()),
      },
    });

    // Re-throw to let Next.js handle the error
    throw error;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
