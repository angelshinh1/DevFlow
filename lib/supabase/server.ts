import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { clientEnv } from "@/lib/client-env";
import type { Database } from "@/lib/types/database";

/**
 * Supabase client for Server Components, Server Actions, and Route Handlers.
 *
 * `cookies()` is async in Next.js 16, so this factory is async too. The
 * `setAll` may be called from a Server Component where mutating cookies is
 * disallowed — that's expected and harmless because `proxy.ts` refreshes the
 * session on every request, so we swallow the resulting error.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component render — proxy.ts handles refresh.
          }
        },
      },
    },
  );
}
