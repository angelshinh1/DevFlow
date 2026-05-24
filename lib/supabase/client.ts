import { createBrowserClient } from "@supabase/ssr";
import { clientEnv } from "@/lib/client-env";
import type { Database } from "@/lib/types/database";

/**
 * Supabase client for Client Components. Reads/writes the auth session from
 * browser cookies. Safe to call on every render — the SDK memoizes internally.
 */
export function createClient() {
  return createBrowserClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
