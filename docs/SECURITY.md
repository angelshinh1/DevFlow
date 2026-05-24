# Security & RLS verification

DevFlow's data isolation rests on Postgres **Row Level Security**. Every policy
on `profiles` and `reviews` compares `auth.uid()` against the row owner, so even
though the app authenticates with the public anon key, a user can only ever read
or write their own rows.

## Automated check

Run [`supabase/tests/rls_isolation.sql`](../supabase/tests/rls_isolation.sql) in
the Supabase SQL Editor. It creates two users, inserts a review as each, and
asserts neither can see the other's. A pass prints two `RLS OK` notices; a
failure raises an exception. The script rolls back, leaving no data behind.

## Manual check (two real accounts)

1. Sign in with **GitHub account A**, open a PR, and generate a review.
2. Confirm it appears under **Review history**.
3. Sign out, sign in with **GitHub account B**.
4. Confirm account B's **Review history** is empty (does not show A's review).
5. (Optional) In the Supabase SQL Editor as `postgres`, run
   `select user_id, repo_full_name from public.reviews;` — you'll see both rows,
   because the `postgres` role bypasses RLS. This confirms the data exists and
   that isolation is enforced at the *policy* layer, not by hiding rows.

## Other safeguards

- **GitHub scopes** are read-only (`read:user repo`). The provider token is kept
  in an **httpOnly** cookie ([`lib/github/token.ts`](../lib/github/token.ts)) and
  never reaches client JavaScript.
- **Server-only modules** (`import "server-only"`) prevent secrets and the
  Supabase service surface from being bundled into the client.
- **Environment validation** ([`lib/env.ts`](../lib/env.ts)) fails fast on
  missing/malformed secrets.
- **Log redaction** — pino redacts `access_token`, `refresh_token`,
  `provider_token`, and auth headers/cookies ([`lib/logger.ts`](../lib/logger.ts)).
- **Open-redirect protection** — the OAuth callback only honors same-origin
  relative `next` paths.
