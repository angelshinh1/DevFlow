import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { RepoCard } from "@/components/repo-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Stagger, FadeInItem } from "@/components/ui/motion";
import { RepoIcon } from "@/components/ui/icons";
import { getRepos } from "@/lib/data";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const repos = await getRepos();

  return (
    <>
      <Header>
        <h1 className="text-sm font-semibold text-fg">Dashboard</h1>
      </Header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-12 sm:px-10 sm:py-16">
          {/* Editorial section heading — asymmetric, generous whitespace */}
          <div className="mb-12 grid gap-x-12 gap-y-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.18em] text-fg-subtle">
                Chapter I — Repositories
              </p>
              <h2 className="font-display text-[clamp(2.25rem,4.5vw,3.5rem)] font-medium tracking-tight text-fg">
                Your <span className="editorial-em">working</span> set.
              </h2>
            </div>
            <p className="max-w-md text-[1.02rem] leading-relaxed text-fg-muted lg:justify-self-end lg:text-right">
              Pick a repository to browse its open pull requests and generate a
              structured AI review.
            </p>
          </div>

          {repos.length === 0 ? (
            <EmptyState
              icon={<RepoIcon className="size-6" />}
              title="No repositories found"
              description="We couldn't find any repositories on your GitHub account. Create one or check your access scopes."
            />
          ) : (
            <Stagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {repos.map((repo) => (
                <FadeInItem key={repo.id}>
                  <RepoCard repo={repo} />
                </FadeInItem>
              ))}
            </Stagger>
          )}
        </div>
      </div>
    </>
  );
}
