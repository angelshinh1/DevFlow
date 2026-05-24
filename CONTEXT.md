# DevFlow -- Project Context for Agents

## Project Overview

DevFlow is a full-stack AI-powered GitHub PR code review dashboard built as a portfolio piece. It lets authenticated GitHub users browse their repositories, view pull requests, and generate structured AI reviews powered by Gemini.

## Tech Stack

- Next.js 16.2.6 (see AGENTS.md for breaking changes)
- TypeScript strict mode
- Tailwind CSS v4
- Supabase (GitHub OAuth + Postgres + RLS)
- Octokit (GitHub REST API)
- Gemini AI (gemini-3.5-flash) with structured JSON output
- Framer Motion
- pino logging
- React 19

## Design System

Dark-mode only. Linear/Vercel minimalist aesthetic. All tokens live in `app/globals.css` under `@theme`.

### Accent Color

The accent color is yellow, not purple or violet. Any purple/violet is a mistake.

- `--color-accent: #fffabc` -- light yellow, used for icon highlights and hover states
- `--color-accent-strong: #c9b800` -- saturated yellow, used as solid button background
- `--color-accent-soft: #1e1c04` -- very dark yellow tint, used for soft badge backgrounds

The accent button variant in `components/ui/button.tsx` uses `text-canvas` (dark text) because `accent-strong` is a light yellow background. Do not use `text-white` on accent buttons.

The box shadow on accent buttons uses `rgba(201,184,0,...)` derived from `accent-strong`, not any purple value.

### Selection Color

`::selection` background is `#F8EDC0` with `color: #0a0a0a`. This is intentional -- the yellow highlight requires dark text for contrast.

### Ambient Glow

The `body::before` radial gradient uses `rgba(255, 250, 188, ...)` (yellow-tinted).

### Scrollbars

Custom thin scrollbars via `scrollbar-width: thin` and `scrollbar-color: var(--color-line-strong) transparent`.

### Skeleton Loader

Defined as a Tailwind `@utility skeleton` block in globals.css. Uses a shimmer animation called `devflow-shimmer`.

## Key Architecture Decisions

### Next.js 16 Specifics

- `params` and `searchParams` are Promises and must be awaited: `const { id } = await params`
- `cookies()` and `headers()` are async
- `middleware.ts` does NOT work -- use `proxy.ts` with a named export `proxy` (not default)
- Turbopack is used in dev

### Supabase

- SSR client uses `getAll`/`setAll` cookie pattern (not individual `get`/`set`)
- RLS is enabled -- all queries are scoped via `auth.uid()`
- `auth.getUser()` is used (not `getSession()`) on the server for security
- GitHub provider token is lost on Supabase session refresh. It is persisted to an httpOnly cookie at the OAuth callback and read from that cookie first in the GitHub API wrapper.

### GitHub API

- Octokit with the persisted provider token
- Token is read from httpOnly cookie, not from Supabase session

### AI Review

- Gemini `gemini-3.5-flash` model
- Uses `responseSchema` + `responseMimeType: "application/json"` for structured output
- Output is validated against a Zod schema before being stored
- Review is stored in Supabase and reused until the user regenerates

### Data Layer (`lib/data.ts`)

- React `cache()` wrappers deduplicate calls within a single request (layout + page share data without double-fetching)
- `server-only` import prevents data functions from leaking into the client bundle
- `coerceJsonArray` helper: Supabase `jsonb` fields may arrive as either parsed arrays or JSON strings depending on the query path. This helper normalizes both cases. Used for `ai_bugs` and `ai_suggestions` on the reviews table.

```ts
function coerceJsonArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}
```

### Zod v4

Use `z.url()` not `z.string().url()`. The latter is deprecated in Zod v4.

### React 19 Lint

The `react-hooks/set-state-in-effect` rule is active. Do not write `useEffect(() => setState(...), [dep])`. Use render-time state adjustment: compare previous state and call setState during render when the dependency changes.

## Component Notes

### Logo (`components/layout/logo.tsx`)

Uses Next.js `Image` from `next/image`. Points to `/devflow-logo.png` in the `public` folder. The `compact` prop renders 24x24; the default renders 96x32. Uses `object-contain` and `priority`.

### Sidebar (`components/layout/sidebar.tsx`)

The logo header row has `mt-3` for top margin. This is intentional.

### AI Review Panel (`components/pr/review-panel.tsx`)

The panel is sticky on desktop (`lg:sticky lg:top-6 lg:self-start` on the parent in the page layout). To make it scroll independently without requiring full-page scroll:

- Outer wrapper: `flex flex-col` with inline style `maxHeight: "calc(100dvh - 5rem)"`
- Header div: `shrink-0` so the title bar never shrinks away
- Body div: `flex-1 overflow-y-auto` for independent scroll

The `100dvh` unit is used (not `100vh`) to handle mobile browser chrome correctly.

### Button (`components/ui/button.tsx`)

Five variants: `primary`, `secondary`, `ghost`, `accent`, `danger`. Default variant is `secondary`. The `loading` prop shows a spinner and disables the button.

## File Structure Highlights

```
app/
  (app)/               -- authenticated route group
    dashboard/
    history/
    pr/[owner]/[name]/[number]/
      actions.ts       -- server actions for AI review generation
    repo/[owner]/[name]/
  (auth)/              -- unauthenticated route group
    login/
  globals.css          -- design tokens and base styles
  layout.tsx           -- root layout with font loading

components/
  layout/
    sidebar.tsx
    nav-link.tsx
    logo.tsx
    sign-out-button.tsx
  pr/
    review-panel.tsx
    diff-viewer.tsx
  ui/
    button.tsx
    badge.tsx
    avatar.tsx
    icons.tsx

lib/
  data.ts              -- all data fetching (server-only, cached)
  github.ts            -- Octokit wrapper
  ai.ts                -- Gemini integration
  supabase/
    server.ts          -- SSR Supabase client
    client.ts          -- browser Supabase client
  types/
    review.ts          -- AIReview type
  utils.ts             -- cn, timeAgo, etc.
  env.ts               -- server env validation (Zod)
  client-env.ts        -- client env validation (Zod)

proxy.ts               -- replaces middleware.ts (named export `proxy`)
```

## Environment Variables

Never hardcode secrets. The user fills `.env.local` manually. Do not ask for values in chat.

Server-side (validated in `lib/env.ts`):
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `GITHUB_PROVIDER_TOKEN_COOKIE_SECRET`

Client-side (validated in `lib/client-env.ts`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Known Gotchas

1. Supabase typed client: the `Update` type for tables must be a proper partial type, not `never`. Tables need `Relationships: []` and the schema needs `CompositeTypes: Record<string, never>`.
2. `ai_bugs` and `ai_suggestions` from Supabase may be JSON strings -- always run through `coerceJsonArray`.
3. Provider token is lost on session refresh -- always read from the httpOnly cookie first.
4. Do not use `middleware.ts` -- use `proxy.ts` with named export.
5. Accent color is yellow -- never introduce purple or violet into the codebase.
