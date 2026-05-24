import { Suspense } from "react";
import type { Metadata } from "next";
import { Logo } from "@/components/layout/logo";
import { SparkleIcon, PullRequestIcon, HistoryIcon } from "@/components/ui/icons";
import { LoginButton } from "./login-button";

export const metadata: Metadata = {
  title: "Sign in",
};

const FEATURES = [
  { icon: PullRequestIcon, text: "Browse your repos and open pull requests" },
  { icon: SparkleIcon, text: "Generate structured AI reviews with Gemini" },
  { icon: HistoryIcon, text: "Revisit every review you've run" },
];

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo className="mb-6 scale-110" />
          <h1 className="text-2xl font-semibold tracking-tight text-fg">
            AI code review for your pull requests
          </h1>
          <p className="mt-2 text-sm text-fg-muted">
            Connect GitHub to review PRs with structured, severity-rated feedback.
          </p>
        </div>

        <div className="rounded-[var(--radius-card)] border border-line bg-surface p-6">
          <ul className="mb-6 flex flex-col gap-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-fg-muted">
                <span className="grid size-7 shrink-0 place-items-center rounded-md bg-accent-soft text-accent">
                  <Icon className="size-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>

          <Suspense fallback={<div className="skeleton h-10 w-full rounded-lg" />}>
            <LoginButton />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-xs text-fg-subtle">
          We only request read access to your repositories.
        </p>
      </div>
    </main>
  );
}
