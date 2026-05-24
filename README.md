<div align="center">

# DevFlow

### AI-powered code review for your GitHub pull requests

Browse your repositories, open pull requests, and get structured, severity-rated
AI reviews — summary, likely bugs, and concrete suggestions — powered by Gemini.

[Tech stack](#tech-stack) · [Features](#features) · [Getting started](#getting-started) · [Architecture](#architecture) · [Security](#security--row-level-security)

![DevFlow dashboard](docs/images/dashboard.png)

</div>

---

## Overview

DevFlow connects to your GitHub account, lets you drill from **repository → open
pull request → diff**, and generates a structured AI review you can save and
revisit. Reviews are persisted per-user in Supabase with Row Level Security, so
your review history is private to you.

It's built on **Next.js 16** (App Router, React Server Components, Turbopack),
typed end-to-end with **TypeScript strict mode**, and styled with a deliberately
minimal, dark-only Linear/Vercel-leaning aesthetic.

## Features

- **GitHub OAuth** via Supabase Auth — one click, read-only repo scopes
- **Repository browser** — your repos, sorted by recent activity
- **Pull request list** — open PRs per repo with author, branches, and status
- **Diff viewer** — collapsible per-file unified diff with add/remove highlighting
- **AI review panel** — a structured review with:
  - a plain-language **summary**
  - **likely bugs**, each with its own severity (low / medium / high) and location
  - non-blocking **suggestions**
  - an overall **severity** derived from the most serious finding
- **Saved reviews** — every review is persisted; re-open a PR to see the last review instantly
- **Review history** — all your past reviews in one place
- **Production-grade polish** — loading skeletons (not spinners), error boundaries on every async route, structured logging, validated environment, subtle entrance animations

<div align="center">

| PR detail + AI review | Review history |
| --- | --- |
| ![PR detail](docs/images/pr-detail.png) | ![History](docs/images/history.png) |

</div>

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, RSC, Turbopack) |
| Language | TypeScript (strict, no `any`) |
| Styling | Tailwind CSS v4 (CSS-first `@theme` tokens) |
| Auth & DB | Supabase (GitHub OAuth, Postgres, Row Level Security) |
| GitHub API | Octokit REST |
| AI | Google Gemini (`gemini-1.5-flash`) with JSON-schema-constrained output |
| Validation | Zod (environment + AI response) |
| Logging | pino (pretty in dev, JSON in prod) |
| Animation | Framer Motion |

## Getting started

### Prerequisites

- Node.js 20.9+ (Next.js 16 minimum)
- A [Supabase](https://supabase.com) project
- A [Google AI Studio](https://aistudio.google.com/apikey) API key
- A GitHub account

### 1. Install

```bash
npm install
```

### 2. Configure Supabase auth

1. In your Supabase project: **Authentication → Providers → GitHub**, toggle it on.
2. Create a **GitHub OAuth App** (GitHub → Settings → Developer settings → OAuth Apps):
   - **Authorization callback URL:** `https://<your-project-ref>.supabase.co/auth/v1/callback`
3. Copy the GitHub **Client ID** and **Client Secret** into the Supabase GitHub provider settings.

### 3. Apply the database schema

Run [`supabase/migrations/20260524000000_init.sql`](supabase/migrations/20260524000000_init.sql)
in the Supabase **SQL Editor** (or `supabase db push`). This creates the
`profiles` and `reviews` tables, the `severity` enum, indexes, the auto-profile
trigger, and **all RLS policies**.

### 4. Environment variables

```bash
cp .env.example .env.local
```

Fill in:

| Variable | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `GEMINI_API_KEY` | Google AI Studio |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` for local dev |

Environment variables are validated with Zod at startup ([`lib/env.ts`](lib/env.ts)) —
a missing or malformed value fails fast with a readable error.

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with GitHub.

## Architecture

```
Browser ──► Next.js (App Router, RSC)
              │
              ├─ proxy.ts ............ refreshes Supabase session, gates routes
              │
              ├─ Server Components ... fetch repos/PRs (Octokit) + reviews (Supabase)
              │
              ├─ Server Action ....... generateReviewAction:
              │       GitHub diff ─► Gemini (JSON schema) ─► Zod ─► Supabase insert
              │
              └─ Client Components ... ReviewPanel, DiffViewer, auth buttons
```

### Project structure

```
app/
  (app)/                 # authenticated shell (sidebar layout)
    dashboard/           # repo browser
    repo/[owner]/[name]/ # open PR list
    pr/[owner]/[name]/[number]/   # diff + AI review panel + server action
    history/             # saved reviews
  auth/                  # OAuth callback + signout route handlers
  login/                 # public sign-in page
components/
  ui/                    # Button, Card, Badge, Skeleton, Avatar, icons, motion
  layout/                # Sidebar, Header, NavLink, Logo
  pr/                    # PRCard, DiffViewer, ReviewPanel
lib/
  supabase/              # browser + server clients, proxy session helper
  github/                # Octokit wrapper (repos, pulls, diff, token handling)
  gemini/                # prompt + JSON-schema-constrained review generation
  types/                 # shared TypeScript interfaces
  env.ts                 # Zod-validated environment
  logger.ts              # pino structured logging
supabase/migrations/     # SQL schema + RLS
```

### How the AI review works

1. The PR's unified diff is fetched from GitHub (truncated past 60k chars to bound the prompt).
2. A senior-reviewer system prompt + the diff are sent to Gemini, constrained to a strict JSON schema.
3. The response is validated with Zod ([`lib/gemini/review.ts`](lib/gemini/review.ts)); malformed output is rejected rather than rendered.
4. Overall severity is derived deterministically from the most serious bug.
5. The review is persisted to Supabase and revalidated into the page.

The prompt explicitly discourages inventing findings — *"an empty, honest review
is better than noise."*

## Security & Row Level Security

- **Read-only GitHub scopes** (`read:user repo`); the provider token is stored in an httpOnly cookie, never exposed to client JS.
- **Row Level Security** is enabled on every table. Each policy compares `auth.uid()`, so a user can only ever read or write their own `profiles` and `reviews` rows — even though the app uses the public anon key.
- Secrets are server-only (`server-only` imported in sensitive modules) and never bundled to the client.
- Logs redact tokens via pino's `redact` config.

An isolation test script is provided at
[`supabase/tests/rls_isolation.sql`](supabase/tests/rls_isolation.sql) — it
creates two users, has each insert a review, and asserts neither can see the
other's. See [the security checklist](docs/SECURITY.md) for the manual verification steps.

## Scripts

```bash
npm run dev     # start dev server (Turbopack)
npm run build   # production build
npm run start   # serve the production build
npm run lint    # ESLint (flat config)
```

## License

MIT — built as a portfolio project.
