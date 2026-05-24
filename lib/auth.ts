import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export interface CurrentUser {
  id: string;
  username: string;
  avatarUrl: string | null;
}

/**
 * Resolves the signed-in user joined with their profile row. Request-cached so
 * the layout and pages share a single auth round-trip. Returns null if there's
 * no session (proxy.ts normally redirects before we get here).
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("github_username, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const meta = user.user_metadata as { user_name?: string; avatar_url?: string };

  return {
    id: user.id,
    username: profile?.github_username ?? meta.user_name ?? user.email ?? "You",
    avatarUrl: profile?.avatar_url ?? meta.avatar_url ?? null,
  };
});
