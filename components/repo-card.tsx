import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/utils";
import type { GitHubRepo } from "@/lib/types/github";

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  Java: "#b07219",
  Ruby: "#701516",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
};

export function RepoCard({ repo }: { repo: GitHubRepo }) {
  return (
    <Link href={`/repo/${repo.owner}/${repo.name}`} className="block rounded-[var(--radius-card)]">
      <Card interactive className="flex h-full flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display truncate text-xl font-medium tracking-tight text-fg">
            {repo.name}
          </h3>
          {repo.private && (
            <Badge variant="neutral" className="shrink-0">
              Private
            </Badge>
          )}
        </div>

        <p className="mt-2 line-clamp-2 min-h-[2.75rem] text-sm leading-relaxed text-fg-muted">
          {repo.description ?? <span className="italic text-fg-subtle">No description provided.</span>}
        </p>

        <div className="mt-auto pt-5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line pt-4 text-xs text-fg-subtle">
            {repo.language && (
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: LANGUAGE_COLORS[repo.language] ?? "#8C8676" }}
                  aria-hidden
                />
                {repo.language}
              </span>
            )}
            <span>★ {repo.stars}</span>
            <span>{repo.openIssues} issues</span>
            {repo.pushedAt && <span className="ml-auto font-display italic">{timeAgo(repo.pushedAt)}</span>}
          </div>
        </div>
      </Card>
    </Link>
  );
}
