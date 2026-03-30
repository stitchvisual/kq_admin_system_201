import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const { data, error } = await supabase.auth.getUser();
  const user = data.user;

  // If the refresh token is invalid/expired, clear the session cookies
  // so we don't keep attempting to refresh on every request.
  if (error) {
    const message = (error.message || '').toLowerCase();
    const looksLikeInvalidRefresh =
      message.includes('invalid refresh token') || message.includes('refresh token');

    if (looksLikeInvalidRefresh) {
      // signOut clears cookies via the `cookies.setAll` hook above.
      try {
        await supabase.auth.signOut();
      } catch {
        // If clearing fails for any reason, still allow the normal redirect below.
      }
    }
  }

  // Protect /admin routes
  if (request.nextUrl.pathname.startsWith("/admin") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
