import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "accent" | "danger";
type Size = "sm" | "md";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap " +
  "transition-[background,color,border,opacity] duration-150 disabled:opacity-50 " +
  "disabled:pointer-events-none select-none";

const variants: Record<Variant, string> = {
  primary: "bg-fg text-canvas hover:bg-white",
  secondary: "bg-surface-raised text-fg border border-line hover:bg-surface-hover hover:border-line-strong",
  ghost: "text-fg-muted hover:text-fg hover:bg-surface-hover",
  accent:
    "bg-accent-strong text-canvas hover:bg-accent shadow-[0_0_0_1px_rgba(201,184,0,0.4),0_8px_24px_-8px_rgba(201,184,0,0.5)]",
  danger: "bg-[var(--color-sev-high-soft)] text-[var(--color-sev-high)] border border-[var(--color-sev-high)]/30 hover:border-[var(--color-sev-high)]/60",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", loading = false, disabled, className, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading && (
        <span
          aria-hidden
          className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
});
