import { cn } from "@/lib/utils";

/** DevFlow wordmark: a violet "flow" glyph + the name. */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="grid size-7 place-items-center rounded-lg bg-accent-strong shadow-[0_0_16px_-2px_rgba(110,86,207,0.7)]">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M3 4.5h7a2.5 2.5 0 0 1 0 5H6a2.5 2.5 0 0 0 0 5h7"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {!compact && <span className="text-sm font-semibold tracking-tight text-fg">DevFlow</span>}
    </span>
  );
}
