import "server-only";
import { z } from "zod";

/**
 * Server-side environment contract. Validated once at module load so a
 * misconfigured deploy fails loudly at startup instead of at the first request.
 *
 * Client-exposed values (NEXT_PUBLIC_*) are intentionally re-validated here too
 * because the server needs them as well; the client reads them separately via
 * `clientEnv` which only touches NEXT_PUBLIC_ vars.
 */
const serverSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
  NEXT_PUBLIC_SITE_URL: z
    .url("NEXT_PUBLIC_SITE_URL must be a valid URL")
    .default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
});

function loadServerEnv() {
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(
      `Invalid environment configuration:\n${issues}\n\n` +
        "Copy .env.example to .env.local and fill in the values.",
    );
  }
  return parsed.data;
}

export const env = loadServerEnv();
export type Env = z.infer<typeof serverSchema>;
