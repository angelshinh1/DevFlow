import { Suspense } from "react";
import type { Metadata } from "next";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SparkleIcon, PullRequestIcon, HistoryIcon } from "@/components/ui/icons";
import { LoginButton } from "./login-button";

export const metadata: Metadata = {
  title: "Sign in",
};

const CHAPTERS = [
  { numeral: "I", icon: PullRequestIcon, label: "Browse your repos and open pull requests" },
  { numeral: "II", icon: SparkleIcon, label: "Generate structured AI reviews with Gemini" },
  { numeral: "III", icon: HistoryIcon, label: "Revisit every review you've run" },
];

export default function LoginPage() {
  return (
    <main className="relative min-h-dvh">
      {/* Top bar - logotype + theme toggle */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 pt-8 sm:px-10 sm:pt-10">
        <Logo className="text-2xl" />
        <ThemeToggle />
      </header>

      {/* Asymmetric editorial split - text on the left, sign-in card on the right. */}
      <section className="mx-auto grid max-w-6xl items-center gap-x-16 gap-y-12 px-6 pb-24 pt-12 sm:px-10 sm:pt-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-x-24 lg:pt-28">
        <div className="max-w-2xl">
          <p className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-fg-subtle">
            <span className="size-1 rounded-full bg-fg-subtle" aria-hidden />
            An AI reviewer for your pull requests
          </p>

          <h1 className="font-display display-relaxed text-[clamp(2.75rem,6.5vw,5.25rem)] font-medium text-fg">
            <span className="drop-cap">Read</span> the diff,{" "}
            <span className="editorial-em">surface the bugs</span>,
            <br className="hidden sm:block" />
            ship with <span className="accent-mark">confidence</span>.
          </h1>

          <p className="mt-8 max-w-[38rem] text-[1.05rem] leading-relaxed text-fg-muted">
            DevFlow turns every pull request into a structured, severity-rated review -
            so you spend less time hunting through diffs and more time shipping the
            work that matters.
          </p>

          <ol className="mt-10 flex flex-col gap-1 border-t border-line pt-6">
            {CHAPTERS.map(({ numeral, icon: Icon, label }) => (
              <li
                key={numeral}
                className="flex items-baseline justify-between gap-6 py-3 text-sm text-fg-muted"
              >
                <span className="inline-flex items-center gap-3">
                  <span className="text-fg-subtle">
                    <Icon className="size-4" />
                  </span>
                  {label}
                </span>
                <span className="font-display text-xs uppercase tracking-[0.18em] text-fg-subtle">
                  {numeral}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* Sign-in card - slightly offset, paper-like surface. */}
        <div className="relative">
          <div
            aria-hidden
            className="absolute -inset-4 -z-10 rounded-[calc(var(--radius-card)+8px)] bg-accent-soft/60 blur-2xl"
          />
          <div className="rounded-[var(--radius-card)] border border-line bg-surface p-7 card-shadow sm:p-9">
            <p className="font-display text-xs uppercase tracking-[0.2em] text-fg-subtle">
              Sign in
            </p>
            <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-fg">
              Connect with GitHub
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-fg-muted">
              We only request read access to your repositories - enough to fetch
              pull requests and their diffs.
            </p>

            <div className="my-7 h-px w-full bg-line" />

            <Suspense fallback={<div className="skeleton h-12 w-full rounded-lg" />}>
              <LoginButton />
            </Suspense>

            <p className="mt-6 text-xs leading-relaxed text-fg-subtle">
              By continuing you authorize DevFlow to read your repositories and
              pull-request metadata via GitHub OAuth.
            </p>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl border-t border-line px-6 py-6 text-xs text-fg-subtle sm:px-10">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <span>© DevFlow</span>
          <span className="font-display italic">Powered by Gemini.</span>
        </div>
      </footer>
    </main>
  );
}
