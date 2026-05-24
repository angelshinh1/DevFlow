"use client";

import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { ChevronRightIcon, MenuIcon } from "@/components/ui/icons";
import { useSidebar } from "./sidebar-context";

/** Sticky top bar for the main content column. Shows a menu button on mobile. */
export function Header({ children, actions }: { children: ReactNode; actions?: ReactNode }) {
  const { openSidebar } = useSidebar();

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-line bg-canvas/80 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={openSidebar}
          aria-label="Open menu"
          className="-ml-1 grid size-9 shrink-0 place-items-center rounded-md text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg lg:hidden"
        >
          <MenuIcon className="size-5" />
        </button>
        <div className="flex min-w-0 items-center gap-2">{children}</div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}

export interface Crumb {
  label: string;
  href?: string;
}

/** Slash-separated breadcrumb trail for nested pages. */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex min-w-0 items-center gap-1.5 text-sm" aria-label="Breadcrumb">
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <Fragment key={`${item.label}-${i}`}>
            {i > 0 && <ChevronRightIcon className="size-3.5 shrink-0 text-fg-subtle" />}
            {item.href && !last ? (
              <Link
                href={item.href}
                className="truncate text-fg-muted transition-colors hover:text-fg"
              >
                {item.label}
              </Link>
            ) : (
              <span className={last ? "truncate font-medium text-fg" : "truncate text-fg-muted"}>
                {item.label}
              </span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
