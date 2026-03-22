import { createClient } from "@/lib/supabase/server";
import { UnauthorizedError } from "@/lib/errors";

export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function requireAdmin() {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw new UnauthorizedError("You must be logged in");
  }

  // Single admin check via email
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail && user.email !== adminEmail) {
    throw new UnauthorizedError("Admin access required");
  }

  return user;
}
