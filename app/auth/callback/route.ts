import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Where to send the user after the password is updated
  const next = searchParams.get("next") ?? "/update-password";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Session is now active in the browser cookies — forward to the
      // update-password page so the user can set their new password.
      return NextResponse.redirect(`${origin}/update-password`);
    }
  }

  // Something went wrong — redirect back to login with an error param
  return NextResponse.redirect(`${origin}/login?error=invalid_reset_link`);
}
