"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/**
 * Shared error UI for route `error.tsx` boundaries. Logs the error once on mount
 * and offers a retry that re-runs the failed segment.
 */
export function ErrorState({
  error,
  reset,
  title = "Something went wrong",
}: {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="flex max-w-md flex-col items-center gap-4 rounded-[var(--radius-card)] border border-line bg-surface px-6 py-12 text-center">
        <span className="grid size-11 place-items-center rounded-full bg-[var(--color-sev-high-soft)] text-[var(--color-sev-high)] text-lg">
          !
        </span>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-fg">{title}</p>
          <p className="text-sm text-fg-muted">
            {error.message || "An unexpected error occurred. Please try again."}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
