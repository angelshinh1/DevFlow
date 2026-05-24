import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { PullRequestIcon, ChevronRightIcon } from "@/components/ui/icons";
import { timeAgo } from "@/lib/utils";
import type { PullRequestSummary } from "@/lib/types/github";

interface PRCardProps {
  pr: PullRequestSummary;
  owner: string;
  name: string;
}

export function PRCard({ pr, owner, name }: PRCardProps) {
  return (
    <Link
      href={`/pr/${owner}/${name}/${pr.number}`}
      className="block rounded-[var(--radius-card)]"
    >
      <Card interactive className="flex items-center gap-4 p-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-raised text-[var(--color-sev-low)]">
          <PullRequestIcon className="size-4" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-fg">{pr.title}</span>
            {pr.draft ? (
              <Badge variant="draft" className="shrink-0">
                Draft
              </Badge>
            ) : (
              <Badge variant="open" dot className="shrink-0">
                Open
              </Badge>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-subtle">
            <span>#{pr.number}</span>
            <span className="inline-flex items-center gap-1.5">
              <Avatar src={pr.authorAvatarUrl} alt={pr.authorLogin} size={16} />
              {pr.authorLogin}
            </span>
            <span className="font-mono text-[0.7rem]">
              {pr.baseRef} ← {pr.headRef}
            </span>
            <span>updated {timeAgo(pr.updatedAt)}</span>
          </div>
        </div>

        <ChevronRightIcon className="size-4 shrink-0 text-fg-subtle" />
      </Card>
    </Link>
  );
}
