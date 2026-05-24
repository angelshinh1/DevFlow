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

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold tracking-tight text-fg">Your repositories</h2>
          <p className="text-sm text-fg-muted">
            Pick a repository to review its open pull requests.
          </p>
        </div>

        {repos.length === 0 ? (
          <EmptyState
            icon={<RepoIcon className="size-6" />}
            title="No repositories found"
            description="We couldn't find any repositories on your GitHub account. Create one or check your access scopes."
          />
        ) : (
          <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {repos.map((repo) => (
              <FadeInItem key={repo.id}>
                <RepoCard repo={repo} />
              </FadeInItem>
            ))}
          </Stagger>
        )}
      </div>
    </>
  );
}
