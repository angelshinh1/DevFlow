import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import type { Severity } from "@/lib/types/review";

type BadgeVariant = "neutral" | "accent" | "low" | "medium" | "high" | "open" | "draft";

const variants: Record<BadgeVariant, string> = {
  neutral: "bg-surface-raised text-fg-muted border-line",
  accent: "bg-accent-soft text-accent border-accent/30",
  low: "bg-[var(--color-sev-low-soft)] text-[var(--color-sev-low)] border-[var(--color-sev-low)]/25",
  medium: "bg-[var(--color-sev-med-soft)] text-[var(--color-sev-med)] border-[var(--color-sev-med)]/25",
  high: "bg-[var(--color-sev-high-soft)] text-[var(--color-sev-high)] border-[var(--color-sev-high)]/25",
  open: "bg-[var(--color-sev-low-soft)] text-[var(--color-sev-low)] border-[var(--color-sev-low)]/25",
  draft: "bg-surface-raised text-fg-subtle border-line",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  /** Render a small leading status dot. */
  dot?: boolean;
}

export function Badge({ variant = "neutral", dot = false, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}

/** Convenience: a severity badge with a sensible default label. */
export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  const label = severity.charAt(0).toUpperCase() + severity.slice(1);
  return (
    <Badge variant={severity} dot className={className}>
      {label}
    </Badge>
  );
}
