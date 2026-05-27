"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  children: ReactNode;
  /** When true, only an exact path match is considered active. */
  exact?: boolean;
  icon?: ReactNode;
  /** Optional editorial chapter marker (Roman numeral or similar). */
  marker?: string;
}

export function NavLink({ href, children, exact = false, icon, marker }: NavLinkProps) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm",
        "transition-[background,color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
        active
          ? "bg-accent-soft text-fg"
          : "text-fg-muted hover:bg-surface-hover hover:text-fg",
      )}
    >
      {icon && (
        <span
          className={cn(
            "shrink-0 transition-colors",
            active ? "text-fg" : "text-fg-subtle group-hover:text-fg-muted",
          )}
        >
          {icon}
        </span>
      )}
      <span className="truncate">{children}</span>
      {marker && (
        <span className="ml-auto font-display text-[0.65rem] uppercase tracking-[0.2em] text-fg-subtle">
          {marker}
        </span>
      )}
    </Link>
  );
}
