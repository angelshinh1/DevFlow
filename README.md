<div align="left">


# *Dev*Flow

*Read the diff, surface the bugs, ship with confidence.*


</div>

<img src="public/login-page-light.png" alt="DevFlow - light mode" width="100%" />

<br />

---

DevFlow connects your GitHub account to a structured AI review pipeline. Open a pull request, generate a review, and get back a plain-language summary, a ranked list of likely bugs with file locations and severity scores, and actionable suggestions - all in a sticky panel alongside the diff.

Reviews are stored per-user. Come back to them later. Regenerate when the code changes. Everything is scoped to you with row-level security.

---

## The app


<table>
<tr>
<td width="50%">
<img src="public/dashboard-light.png" alt="Dashboard - light" />
</td>
<td width="50%">
<img src="public/dashboard-dark.png" alt="Dashboard - dark" />
</td>
</tr>
</table>

<div align="center"><sub>Dashboard &nbsp;·&nbsp; light &amp; dark</sub></div>

<table>
<tr>
<td width="50%">
<img src="public/review-light.png" alt="PR review - light" />
</td>
<td width="50%">
<img src="public/review-dark.png" alt="PR review - dark" />
</td>
</tr>
</table>

<div align="center"><sub>PR detail + AI review panel &nbsp;·&nbsp; light &amp; dark</sub></div>

<table>
<tr>
<td width="50%">
<img src="public/login-page-light.png" alt="Login - light" />
</td>
<td width="50%">
<img src="public/login-page-dark.png" alt="Login - dark" />
</td>
</tr>
</table>

<div align="center"><sub>Sign-in &nbsp;·&nbsp; light &amp; dark</sub></div>

---

## Stack

| | |
|---|---|
| Framework | Next.js 16 · App Router · Turbopack |
| Language | TypeScript strict |
| Styling | Tailwind CSS v4 |
| Auth + DB | Supabase - GitHub OAuth, Postgres, RLS |
| GitHub | Octokit REST |
| AI | Gemini `gemini-3.5-flash` · JSON-schema-constrained output |
| Animation | Framer Motion |
| Typography | Fraunces (display serif) + Geist Sans/Mono |

---

## Getting started

**You'll need:** Node 20+, a Supabase project with GitHub OAuth enabled, and a Gemini API key.

**1.** Install dependencies.

```bash
npm install
```

**2.** Set up your environment.

```bash
cp .env.example .env.local
```

| Variable | Source |
|---|---|
| `SUPABASE_URL` | Supabase -> Project Settings -> API |
| `SUPABASE_ANON_KEY` | Supabase -> Project Settings -> API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase -> Project Settings -> API |
| `GEMINI_API_KEY` | Google AI Studio |
| `GITHUB_PROVIDER_TOKEN_COOKIE_SECRET` | Any random 32-char string |
| `NEXT_PUBLIC_SUPABASE_URL` | Same as `SUPABASE_URL` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same as `SUPABASE_ANON_KEY` |

**3.** Apply the database schema - run `supabase/migrations/20260524000000_init.sql` in the Supabase SQL Editor.

**4.** Start the dev server.

```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000) and sign in with GitHub.

---

<div align="center">

<sub>Built with Next.js · Supabase · Gemini · MIT</sub>

</div>
