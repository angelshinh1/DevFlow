import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** Compact mode: just the "D" monogram. */
  compact?: boolean;
}

/**
 * Text-based logotype using the Fraunces display serif.
 * "Dev" in italic + "Flow" upright - creates visual tension within a single word.
 */
export function Logo({ className, compact = false }: LogoProps) {
  if (compact) {
    return (
      <span
        className={cn(
          "inline-flex items-center font-display font-medium leading-none tracking-tight text-fg text-xl",
          className,
        )}
        aria-label="DevFlow"
      >
        <span className="italic">D</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-baseline font-display font-medium leading-none tracking-tight text-fg",
        !className?.includes("text-") && "text-xl",
        className,
      )}
      aria-label="DevFlow"
    >
      <span className="italic">Dev</span>
      <span>Flow</span>
    </span>
  );
}
