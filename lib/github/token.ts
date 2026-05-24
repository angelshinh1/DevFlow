import "server-only";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

/**
 * GitHub OAuth token handling.
 *
 * Supabase only exposes the GitHub `provider_token` on the session right after
 * sign-in, and it can be dropped when the Supabase access token later refreshes.
 * To keep GitHub API access working across requests we copy the token into our
 * own httpOnly cookie at the OAuth callback, and read from there first.
 */
export const GITHUB_TOKEN_COOKIE = "devflow-gh-token";

const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;

export const githubTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: ONE_WEEK_SECONDS,
};

/** Raised when no usable GitHub token is available — caller should re-auth. */
export class GitHubAuthError extends Error {
  constructor(message = "GitHub authorization is missing or expired. Please sign in again.") {
    super(message);
    this.name = "GitHubAuthError";
  }
}

/**
 * Resolves the current user's GitHub access token: the persisted cookie wins,
 * falling back to a freshly-issued `provider_token` on the live session.
 */
export async function getGitHubToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(GITHUB_TOKEN_COOKIE)?.value;
  if (fromCookie) return fromCookie;

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.provider_token ?? null;
}

/** Same as {@link getGitHubToken} but throws {@link GitHubAuthError} if absent. */
export async function requireGitHubToken(): Promise<string> {
  const token = await getGitHubToken();
  if (!token) throw new GitHubAuthError();
  return token;
}
