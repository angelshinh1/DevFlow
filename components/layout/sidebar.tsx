import Link from "next/link";
import { Logo } from "./logo";
import { NavLink } from "./nav-link";
import { SignOutButton } from "./sign-out-button";
import { Avatar } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { GridIcon, HistoryIcon, RepoIcon, CloseIcon } from "@/components/ui/icons";

export interface SidebarUser {
  username: string;
  avatarUrl: string | null;
}

export interface SidebarRepo {
  fullName: string;
  name: string;
  owner: string;
}

interface SidebarProps {
  user: SidebarUser;
  repos: SidebarRepo[];
  /** When provided, renders a close button (used inside the mobile drawer). */
  onClose?: () => void;
}

/** Persistent left navigation: primary links + the user's repositories. */
export function Sidebar({ user, repos, onClose }: SidebarProps) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-line bg-surface/70 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-5">
        <Link href="/dashboard" className="rounded-md">
          <Logo />
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="-mr-1 grid size-8 place-items-center rounded-md text-fg-muted transition-colors hover:bg-surface-hover hover:text-fg"
          >
            <CloseIcon className="size-4" />
          </button>
        )}
      </div>

      <nav className="flex flex-col gap-0.5 px-3">
        <NavLink href="/dashboard" exact icon={<GridIcon className="size-4" />} marker="I">
          Dashboard
        </NavLink>
        <NavLink href="/history" icon={<HistoryIcon className="size-4" />} marker="II">
          Review history
        </NavLink>
      </nav>

      <div className="mt-8 flex min-h-0 flex-1 flex-col px-3">
        <p className="px-3 pb-2 font-display text-[0.65rem] uppercase tracking-[0.22em] text-fg-subtle">
          Repositories
        </p>
        <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto pb-3">
          {repos.length === 0 ? (
            <p className="px-3 py-2 text-xs italic text-fg-subtle">No repositories found.</p>
          ) : (
            repos.map((repo) => (
              <NavLink
                key={repo.fullName}
                href={`/repo/${repo.owner}/${repo.name}`}
                icon={<RepoIcon className="size-4" />}
              >
                {repo.name}
              </NavLink>
            ))
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-line p-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Avatar src={user.avatarUrl} alt={user.username} size={28} />
          <span className="truncate text-xs font-medium text-fg-muted">{user.username}</span>
        </div>
        <ThemeToggle />
        <SignOutButton />
      </div>
    </aside>
  );
}
