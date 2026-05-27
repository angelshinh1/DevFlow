import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import type { Severity } from "@/lib/types/review";

type BadgeVariant = "neutral" | "accent" | "low" | "medium" | "high" | "open" | "draft";

const variants: Record<BadgeVariant, string> = {
  neutral: "bg-surface-raised text-fg-muted border-line",
  accent: "bg-accent-soft text-fg border-[color-mix(in_oklch,var(--color-accent-strong)_30%,transparent)]",
  low: "bg-[var(--color-sev-low-soft)] text-[var(--color-sev-low)] border-[color-mix(in_oklch,var(--color-sev-low)_25%,transparent)]",
  medium: "bg-[var(--color-sev-med-soft)] text-[var(--color-sev-med)] border-[color-mix(in_oklch,var(--color-sev-med)_25%,transparent)]",
  high: "bg-[var(--color-sev-high-soft)] text-[var(--color-sev-high)] border-[color-mix(in_oklch,var(--color-sev-high)_25%,transparent)]",
  open: "bg-[var(--color-sev-low-soft)] text-[var(--color-sev-low)] border-[color-mix(in_oklch,var(--color-sev-low)_25%,transparent)]",
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
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.7rem] font-medium uppercase tracking-[0.06em]",
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

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  const label = severity.charAt(0).toUpperCase() + severity.slice(1);
  return (
    <Badge variant={severity} dot className={className}>
      {label}
    </Badge>
  );
}
