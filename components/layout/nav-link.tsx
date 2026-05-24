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
}

export function NavLink({ href, children, exact = false, icon }: NavLinkProps) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
        active
          ? "bg-surface-raised text-fg"
          : "text-fg-muted hover:bg-surface-hover hover:text-fg",
      )}
    >
      {icon && (
        <span className={cn("shrink-0", active ? "text-accent" : "text-fg-subtle group-hover:text-fg-muted")}>
          {icon}
        </span>
      )}
      <span className="truncate">{children}</span>
    </Link>
  );
}
