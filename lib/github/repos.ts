import "server-only";
import { getOctokit, githubLog } from "./client";
import type { GitHubRepo } from "@/lib/types/github";

/**
 * Lists the authenticated user's repositories, most recently pushed first.
 * Filtered to repos the user owns or collaborates on (where reviewing PRs is
 * actually useful).
 */
export async function listRepos(): Promise<GitHubRepo[]> {
  const octokit = await getOctokit();
  githubLog.debug("listRepos: fetching");

  const { data } = await octokit.rest.repos.listForAuthenticatedUser({
    sort: "pushed",
    direction: "desc",
    per_page: 50,
    affiliation: "owner,collaborator,organization_member",
  });

  githubLog.info({ count: data.length }, "listRepos: fetched");

  return data.map(
    (r): GitHubRepo => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      owner: r.owner.login,
      description: r.description,
      private: r.private,
      language: r.language ?? null,
      stars: r.stargazers_count ?? 0,
      openIssues: r.open_issues_count ?? 0,
      defaultBranch: r.default_branch ?? "main",
      pushedAt: r.pushed_at ?? null,
      htmlUrl: r.html_url,
    }),
  );
}
