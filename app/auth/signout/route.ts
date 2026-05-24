import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GITHUB_TOKEN_COOKIE } from "@/lib/github/token";

/** Clears the Supabase session and the persisted GitHub token, then → /login. */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const response = NextResponse.redirect(new URL("/login", request.nextUrl.origin));
  response.cookies.delete(GITHUB_TOKEN_COOKIE);
  return response;
}
