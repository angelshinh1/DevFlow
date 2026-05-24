import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { ChevronRightIcon } from "@/components/ui/icons";

/** Sticky top bar for the main content column. */
export function Header({ children, actions }: { children: ReactNode; actions?: ReactNode }) {
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-line bg-canvas/80 px-6 backdrop-blur">
      <div className="flex min-w-0 items-center gap-2">{children}</div>
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
