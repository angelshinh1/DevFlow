"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { SeverityBadge } from "@/components/ui/badge";
import { SparkleIcon } from "@/components/ui/icons";
import { timeAgo } from "@/lib/utils";
import type { AIReview } from "@/lib/types/review";
import { generateReviewAction } from "@/app/(app)/pr/[owner]/[name]/[number]/actions";

interface ReviewPanelProps {
  owner: string;
  name: string;
  number: number;
  initialReview: AIReview | null;
  initialCreatedAt: string | null;
}

export function ReviewPanel({
  owner,
  name,
  number,
  initialReview,
  initialCreatedAt,
}: ReviewPanelProps) {
  const [review, setReview] = useState<AIReview | null>(initialReview);
  const [createdAt, setCreatedAt] = useState<string | null>(initialCreatedAt);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run() {
    setError(null);
    startTransition(async () => {
      const result = await generateReviewAction(owner, name, number);
      if (result.ok) {
        setReview(result.review);
        setCreatedAt(result.createdAt);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    // Soft accent wash framing - feels like a featured editorial column.
    <div className="relative rounded-[var(--radius-card)] bg-gradient-to-br from-accent-soft/80 via-transparent to-transparent p-px card-shadow">
      <div
        className="flex flex-col rounded-[calc(var(--radius-card)-1px)] bg-surface"
        style={{ maxHeight: "calc(100dvh - 5rem)" }}
      >
        <div className="flex shrink-0 items-start gap-3 border-b border-line px-6 py-5">
          <span className="grid size-8 shrink-0 place-items-center rounded-md bg-accent-soft text-fg">
            <SparkleIcon className="size-4" />
          </span>
          <div className="flex-1">
            <p className="font-display text-[0.7rem] uppercase tracking-[0.2em] text-fg-subtle">
              AI review
            </p>
            <p className="mt-0.5 font-display text-lg font-medium leading-tight text-fg">
              {review ? "Findings" : "Awaiting analysis"}
            </p>
            <p className="mt-1 text-xs text-fg-subtle">
              {createdAt ? `Generated ${timeAgo(createdAt)}` : "Powered by Gemini"}
            </p>
          </div>
          {review && (
            <Button variant="ghost" size="sm" onClick={run} loading={pending}>
              Regenerate
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!review && !pending && <EmptyReview onGenerate={run} error={error} />}
          {pending && <GeneratingState />}
          {review && !pending && <ReviewBody review={review} error={error} />}
        </div>
      </div>
    </div>
  );
}

function EmptyReview({ onGenerate, error }: { onGenerate: () => void; error: string | null }) {
  return (
    <div className="flex flex-col items-center gap-5 py-8 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-accent-soft text-fg">
        <SparkleIcon className="size-6" />
      </span>
      <div className="space-y-2">
        <p className="font-display text-lg font-medium text-fg">No review yet</p>
        <p className="mx-auto max-w-xs text-sm leading-relaxed text-fg-muted">
          Generate a structured review of this PR - summary, likely bugs, and
          suggestions with severity ratings.
        </p>
      </div>
      <Button variant="accent" size="md" onClick={onGenerate}>
        <SparkleIcon className="size-4" />
        Generate AI review
      </Button>
      {error && <ErrorLine message={error} />}
    </div>
  );
}

function GeneratingState() {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <span className="size-9 animate-spin rounded-full border-2 border-accent-strong border-t-transparent" />
      <div className="space-y-1">
        <p className="font-display text-base font-medium text-fg">Analyzing the diff…</p>
        <p className="text-xs text-fg-subtle">This usually takes a few seconds.</p>
      </div>
    </div>
  );
}

function ReviewBody({ review, error }: { review: AIReview; error: string | null }) {
  return (
    <div className="flex flex-col gap-8">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-[0.7rem] uppercase tracking-[0.2em] text-fg-subtle">
            Summary
          </h3>
          <SeverityBadge severity={review.severity} />
        </div>
        <p className="text-[0.95rem] leading-relaxed text-fg-muted">{review.summary}</p>
      </section>

      <section>
        <h3 className="mb-3 font-display text-[0.7rem] uppercase tracking-[0.2em] text-fg-subtle">
          Potential bugs · {review.bugs.length}
        </h3>
        {review.bugs.length === 0 ? (
          <p className="text-sm italic text-fg-muted">No likely bugs found in this diff.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {review.bugs.map((bug, i) => (
              <li key={i} className="rounded-lg border border-line bg-surface-raised p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-display text-[0.95rem] font-medium leading-snug text-fg">
                    {bug.title}
                  </p>
                  <SeverityBadge severity={bug.severity} className="shrink-0" />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">{bug.description}</p>
                {bug.location && (
                  <p className="mt-2 font-mono text-[0.7rem] text-fg-subtle">{bug.location}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="mb-3 font-display text-[0.7rem] uppercase tracking-[0.2em] text-fg-subtle">
          Suggestions · {review.suggestions.length}
        </h3>
        {review.suggestions.length === 0 ? (
          <p className="text-sm italic text-fg-muted">No suggestions - nice and clean.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {review.suggestions.map((s, i) => (
              <li key={i} className="rounded-lg border border-line bg-surface-raised p-4">
                <p className="font-display text-[0.95rem] font-medium leading-snug text-fg">
                  {s.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">{s.description}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {error && <ErrorLine message={error} />}
    </div>
  );
}

function ErrorLine({ message }: { message: string }) {
  return (
    <p className="text-center text-xs text-[var(--color-sev-high)]" role="alert">
      {message}
    </p>
  );
}
