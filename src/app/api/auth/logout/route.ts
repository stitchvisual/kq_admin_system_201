import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { clearUserContext } from "@/lib/sentry";
import { handleLogout } from "@/lib/auth";

export async function POST() {
  try {
    const supabase = await createClient();
    
    // Clear Supabase session
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Logout error:', error);
    }

    // Clear Sentry user context
    handleLogout();
    clearUserContext();

    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
  } catch (error) {
    console.error('Logout route error:', error);
    // Still redirect even if there's an error
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
  }
}
