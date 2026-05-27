"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

const STORAGE_KEY = "devflow-theme";

function readTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

/**
 * Compact light/dark toggle. The pre-paint script in the root layout sets the
 * initial `data-theme`; this just flips it and persists the choice.
 */
export function ThemeToggle({ className }: { className?: string }) {
  // Always start with "light" on the server so SSR matches hydration.
  // Sync to actual theme after mount — the pre-paint script already applied
  // the correct visual state, so the brief mismatch is invisible.
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => {
    setTheme(readTheme());
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage may be unavailable (private mode, embedded). The toggle
      // still works for the current session.
    }
    if (next === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      className={cn(
        "group relative inline-flex h-7 w-12 items-center rounded-full border border-line bg-surface-raised transition-colors hover:border-line-strong active:scale-[0.97]",
        "duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
        className,
      )}
    >
      <span
        className={cn(
          "pointer-events-none ml-0.5 inline-flex size-5 items-center justify-center rounded-full bg-fg text-canvas transition-transform duration-300",
          "ease-[cubic-bezier(0.23,1,0.32,1)]",
          isDark && "translate-x-5",
        )}
        aria-hidden
      >
        {isDark ? <MoonIcon /> : <SunIcon />}
      </span>
    </button>
  );
}

function SunIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1.5v1.5M8 13v1.5M14.5 8H13M3 8H1.5M12.6 3.4l-1.06 1.06M4.46 11.54 3.4 12.6M12.6 12.6l-1.06-1.06M4.46 4.46 3.4 3.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
      <path d="M13.5 10.5a5.5 5.5 0 0 1-8-4.94c0-1 .27-1.95.73-2.76A5.5 5.5 0 1 0 13.5 10.5Z" />
    </svg>
  );
}
