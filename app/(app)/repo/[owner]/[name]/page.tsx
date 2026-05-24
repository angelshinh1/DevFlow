import type { Metadata } from "next";
import { Header, Breadcrumb } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { PRCard } from "@/components/pr/pr-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Stagger, FadeInItem } from "@/components/ui/motion";
import { PullRequestIcon } from "@/components/ui/icons";
import { getRepoPulls } from "@/lib/data";

interface RepoPageProps {
  params: Promise<{ owner: string; name: string }>;
}

export async function generateMetadata({ params }: RepoPageProps): Promise<Metadata> {
  const { owner, name } = await params;
  return { title: `${owner}/${name}` };
}

export default async function RepoPage({ params }: RepoPageProps) {
  const { owner, name } = await params;
  const pulls = await getRepoPulls(owner, name);

  return (
    <>
      <Header
        actions={
          <a
            href={`https://github.com/${owner}/${name}/pulls`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="ghost" size="sm">
              View on GitHub
            </Button>
          </a>
        }
      >
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: `${owner}/${name}` },
          ]}
        />
      </Header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold tracking-tight text-fg">Open pull requests</h2>
          <p className="text-sm text-fg-muted">
            {pulls.length} open {pulls.length === 1 ? "PR" : "PRs"} · select one to generate an AI
            review.
          </p>
        </div>

        {pulls.length === 0 ? (
          <EmptyState
            icon={<PullRequestIcon className="size-6" />}
            title="No open pull requests"
            description="This repository has no open PRs right now. Reviews can only be generated for open pull requests."
          />
        ) : (
          <Stagger className="flex flex-col gap-3">
            {pulls.map((pr) => (
              <FadeInItem key={pr.id}>
                <PRCard pr={pr} owner={owner} name={name} />
              </FadeInItem>
            ))}
          </Stagger>
        )}
      </div>
    </>
  );
}
