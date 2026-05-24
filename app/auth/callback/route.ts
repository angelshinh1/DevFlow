import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GITHUB_TOKEN_COOKIE, githubTokenCookieOptions } from "@/lib/github/token";
import { childLogger } from "@/lib/logger";

const log = childLogger("auth-callback");

/**
 * OAuth callback: exchanges the GitHub auth code for a Supabase session and
 * persists the GitHub provider token so the API wrapper can call GitHub on
 * subsequent requests (the token isn't kept on the session after refresh).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = sanitizeNext(searchParams.get("next"));

  if (!code) {
    log.warn("callback hit without an auth code");
    return NextResponse.redirect(new URL("/login?error=missing_code", origin));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    log.error({ err: error }, "exchangeCodeForSession failed");
    return NextResponse.redirect(new URL("/login?error=auth", origin));
  }

  const response = NextResponse.redirect(new URL(next, origin));

  const providerToken = data.session?.provider_token;
  if (providerToken) {
    response.cookies.set(GITHUB_TOKEN_COOKIE, providerToken, githubTokenCookieOptions);
    log.info({ user: data.user?.id }, "session established, GitHub token persisted");
  } else {
    log.warn({ user: data.user?.id }, "no provider_token on session after exchange");
  }

  return response;
}

/** Only allow same-origin relative paths to prevent open-redirects. */
function sanitizeNext(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/dashboard";
  return next;
}
