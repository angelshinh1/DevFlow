import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "accent" | "danger";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap " +
  "transition-[background,color,border,transform,opacity,box-shadow] duration-200 " +
  "ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] " +
  "disabled:opacity-50 disabled:pointer-events-none select-none tracking-[0.005em]";

const variants: Record<Variant, string> = {
  primary:
    "bg-fg text-canvas hover:opacity-90",
  secondary:
    "bg-surface-raised text-fg border border-line hover:bg-surface-hover hover:border-line-strong",
  ghost:
    "text-fg-muted hover:text-fg hover:bg-surface-hover",
  accent:
    "bg-accent-strong text-accent-ink hover:brightness-105 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_22px_-10px_color-mix(in_oklch,var(--color-accent-strong)_70%,transparent)]",
  danger:
    "bg-[var(--color-sev-high-soft)] text-[var(--color-sev-high)] border border-[color-mix(in_oklch,var(--color-sev-high)_40%,transparent)] hover:border-[var(--color-sev-high)]",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-[0.95rem]",
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
