import Link from "next/link";
import { Card } from "@/components/ui/card";
import { SeverityBadge } from "@/components/ui/badge";
import { ChevronRightIcon } from "@/components/ui/icons";
import { timeAgo } from "@/lib/utils";
import type { SavedReview } from "@/lib/types/review";

export function ReviewHistoryCard({ review }: { review: SavedReview }) {
  const [owner, name] = review.repoFullName.split("/");
  const bugCount = review.review.bugs.length;

  return (
    <Link
      href={`/pr/${owner}/${name}/${review.prNumber}`}
      className="block rounded-[var(--radius-card)]"
    >
      <Card interactive className="flex items-center gap-5 p-5">
        <SeverityBadge severity={review.review.severity} className="shrink-0" />

        <div className="min-w-0 flex-1">
          <p className="font-display truncate text-base font-medium leading-snug text-fg">
            {review.prTitle}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-subtle">
            <span className="font-mono">
              {review.repoFullName} #{review.prNumber}
            </span>
            <span>·</span>
            <span>
              {bugCount} {bugCount === 1 ? "issue" : "issues"}
            </span>
            <span>·</span>
            <span className="font-display italic">{timeAgo(review.createdAt)}</span>
          </div>
        </div>

        <ChevronRightIcon className="size-4 shrink-0 text-fg-subtle" />
      </Card>
    </Link>
  );
}
