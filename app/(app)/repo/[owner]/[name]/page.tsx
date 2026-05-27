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

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-12 sm:px-10 sm:py-16">
          <div className="mb-12 grid gap-x-12 gap-y-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="mb-3 inline-flex items-baseline gap-2 text-xs uppercase tracking-[0.18em] text-fg-subtle">
                <span className="font-mono normal-case tracking-normal text-fg-muted">{owner}/{name}</span>
              </p>
              <h2 className="font-display text-[clamp(2.25rem,4.5vw,3.5rem)] font-medium tracking-tight text-fg">
                Open <span className="editorial-em">pull requests</span>.
              </h2>
            </div>
            <p className="max-w-md text-[1.02rem] leading-relaxed text-fg-muted lg:justify-self-end lg:text-right">
              {pulls.length} open {pulls.length === 1 ? "PR" : "PRs"} — select one to
              generate a structured AI review.
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
      </div>
    </>
  );
}
