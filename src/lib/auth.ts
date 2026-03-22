import { createClient } from "@/lib/supabase/server";
import { UnauthorizedError } from "@/lib/errors";
import { captureAuthError, setUserContext, clearUserContext } from "@/lib/sentry";

export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    // Capture authentication failure
    if (error) {
      captureAuthError(error, {
        operation: 'verify',
        reason: error.message,
      });
    }
    return null;
  }

  // Set user context for error tracking
  setUserContext({
    id: user.id,
    email: user.email || undefined,
  });

  return user;
}

export async function requireAdmin() {
  const user = await getAuthenticatedUser();

  if (!user) {
    captureAuthError(new UnauthorizedError("You must be logged in"), {
      operation: 'verify',
      reason: 'No user session found',
    });
    throw new UnauthorizedError("You must be logged in");
  }

  // Single admin check via email
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail && user.email !== adminEmail) {
    captureAuthError(new UnauthorizedError("Admin access required"), {
      operation: 'verify',
      email: user.email,
      reason: 'Email does not match ADMIN_EMAIL',
    });
    throw new UnauthorizedError("Admin access required");
  }

  return user;
}

/**
 * Call this when user logs out to clear Sentry user context
 */
export async function handleLogout() {
  clearUserContext();
}
