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

Dual-mode editorial design. Warm cream light mode is the default; dark (near-black + yellow) is opt-in via theme toggle. All tokens live in `app/globals.css` under `@theme` as CSS variable indirections — `:root` sets light values, `[data-theme="dark"]` overrides with dark values.

### Typography

- **Display**: Fraunces variable serif (`--font-display`). Used for headings, logotype, timestamps. `line-height: 1.04`, `letter-spacing: -0.02em`. Loaded in `app/layout.tsx` with `axes: ["opsz", "SOFT"]`, `style: ["normal", "italic"]`. No `weight` array — required for variable fonts with `axes`.
- **Body/UI**: Geist Sans (`--font-sans`)
- **Mono**: Geist Mono (`--font-mono`)

Editorial CSS utilities (defined in `globals.css`, not Tailwind classes):
- `.font-display` — applies serif, tight leading, tracking-in
- `.display-relaxed` — overrides line-height to 1.15 for large display text that needs breathing room
- `.accent-mark` — soft yellow highlight background (like a marker), `box-decoration-break: clone` so it wraps correctly across lines
- `.drop-cap` — floating oversized first letter via `::first-letter`
- `.editorial-em` — italic serif for inline emphasis

### Theme Architecture

Tokens use CSS variable indirection so all Tailwind utilities switch automatically:
```css
@theme { --color-canvas: var(--canvas); ... }
:root { --canvas: #F4F1EB; }  /* light */
[data-theme="dark"] { --canvas: #0a0a0a; }  /* dark */
```

**Light palette** (warm cream / editorial paper):
- `--canvas: #F4F1EB` (warm cream background)
- `--surface: #FBF8F2` (card surfaces)
- `--accent: #c9b800` (saturated mustard — used differently in light vs dark)
- `--accent-strong: #a09000` (darker mustard for buttons on cream)
- `--accent-soft: #FFF7C2` (pale yellow editorial highlight wash)
- `--accent-ink: #1A1815` (text color on accent surfaces)

**Dark palette** (near-black + yellow brand):
- `--canvas: #0a0a0a`
- `--accent: #fffabc` (light yellow for icon highlights)
- `--accent-strong: #c9b800` (saturated yellow for buttons)
- `--accent-soft: #1e1c04` (very dark yellow tint for soft backgrounds)
- `--accent-ink: #0a0a0a`

The accent color is always yellow. Never introduce purple or violet.

### No-Flash Theme Init

`app/layout.tsx` uses `next/script` with `strategy="beforeInteractive"` inside `<body>` to read `localStorage` and set `data-theme="dark"` before first paint. The `ThemeToggle` component initializes `useState<Theme>("light")` (stable server default) and syncs via `useEffect` to avoid hydration mismatch.

### Accent Button

Uses `text-accent-ink` (dark text) because both light and dark `accent-strong` backgrounds are light/yellow. Never use `text-white` on accent buttons.

### Animations & Motion

- Hover-lift (`card-interactive`): `translateY(-2px)` + shadow increase, guarded by `@media (hover: hover) and (pointer: fine)`. Defined in `globals.css` as a plain class (not Tailwind utility) because arbitrary media variants are unreliable in v4.
- Button press: `active:scale-[0.97]`
- Easing: `cubic-bezier(0.23, 1, 0.32, 1)` (strong ease-out). Never `ease-in` for UI transitions.
- CSS vars: `--ease-out`, `--ease-in-out`, `--ease-drawer`

### Ambient Atmosphere

- `body::before`: dual radial accent glow (yellow-tinted), 55% opacity light / 35% dark
- `body::after`: SVG `feTurbulence` film grain noise. Light: `mix-blend-mode: multiply`, 3.5% opacity. Dark: `mix-blend-mode: screen`, 6% opacity.

### Selection Color

`::selection` background is `var(--color-accent-soft)` with `color: var(--color-fg)`.

### Scrollbars

Custom thin scrollbars via `scrollbar-width: thin` and `scrollbar-color: var(--color-line-strong) transparent`.

### Skeleton Loader

Defined as a Tailwind `@utility skeleton` block in globals.css. Uses a shimmer animation called `devflow-shimmer`.

### Card Shadow

`@utility card-shadow` — editorial box-shadow that adapts per theme. Light: warm brown-tinted layers. Dark: deep black layers.

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

Text-based logotype using Fraunces display serif. "Dev" in italic + "Flow" upright — visual tension in a single word. The `compact` prop renders just the italic "D" monogram. No image file involved. Default size `text-xl`; caller can override via `className` (the component guards against duplicate text-size classes via `!className?.includes("text-")`).

### Sidebar (`components/layout/sidebar.tsx`)

Contains `ThemeToggle` in the footer. Nav links use `accent-soft` active state (`bg-accent-soft text-fg`) with an optional `marker` prop for Roman numeral display. Repo section label uses `font-display` small-caps style.

### AI Review Panel (`components/pr/review-panel.tsx`)

The panel is sticky on desktop (`lg:sticky lg:top-6 lg:self-start` on the parent in the page layout). To make it scroll independently without requiring full-page scroll:

- Outer wrapper: `flex flex-col` with inline style `maxHeight: "calc(100dvh - 5rem)"`
- Header div: `shrink-0` so the title bar never shrinks away
- Body div: `flex-1 overflow-y-auto` for independent scroll

The `100dvh` unit is used (not `100vh`) to handle mobile browser chrome correctly.

### Button (`components/ui/button.tsx`)

Five variants: `primary`, `secondary`, `ghost`, `accent`, `danger`. Default variant is `secondary`. The `loading` prop shows a spinner and disables the button. Has `active:scale-[0.97]` press feedback and `ease-[cubic-bezier(0.23,1,0.32,1)]` transition. Sizes: `sm` (h-8), `md` (h-10, default), `lg` (h-12).

### Theme Toggle (`components/ui/theme-toggle.tsx`)

Light/dark pill toggle. Uses `useState<Theme>("light")` as stable SSR default, syncs to actual stored theme via `useEffect` after mount to prevent hydration mismatch. Writes to `localStorage` key `devflow-theme` and sets/removes `data-theme="dark"` on `document.documentElement`.

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
6. `cn()` is simple string concatenation, not tailwind-merge. Conflicting utilities (e.g., `text-xl` + `text-2xl`) both appear in the output — avoid passing duplicate utility classes.
7. `card-interactive` hover lift is defined in `globals.css` as a plain CSS class inside `@media (hover: hover) and (pointer: fine)`. It is not a Tailwind utility. Do not try to replicate it with arbitrary Tailwind media variants.
8. Fraunces is a variable font — do not pass a `weight` array when configuring it in `next/font/google`. Only `axes`, `style`, `subsets`, and `display` are valid.
9. The no-flash theme script must use `next/script` with `strategy="beforeInteractive"` inside `<body>`. A raw `<script>` tag inside React JSX is never re-executed on the client per React 19 behavior.
