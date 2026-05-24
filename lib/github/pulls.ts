import "server-only";
import type { Octokit } from "@octokit/rest";
import { getOctokit, githubLog } from "./client";
import type { PullRequestSummary, PullRequestDetail } from "@/lib/types/github";

/** GitHub caps a single diff response; keep prompts and payloads bounded. */
export const MAX_DIFF_CHARS = 60_000;

/** Lists open pull requests for a repo, most recently updated first. */
export async function listOpenPullRequests(
  owner: string,
  repo: string,
): Promise<PullRequestSummary[]> {
  const octokit = await getOctokit();
  githubLog.debug({ owner, repo }, "listOpenPullRequests: fetching");

  const { data } = await octokit.rest.pulls.list({
    owner,
    repo,
    state: "open",
    sort: "updated",
    direction: "desc",
    per_page: 50,
  });

  githubLog.info({ owner, repo, count: data.length }, "listOpenPullRequests: fetched");

  return data.map((pr): PullRequestSummary => toSummary(pr));
}

/** Fetches a single PR's metadata plus its unified diff (truncated if huge). */
export async function getPullRequestDetail(
  owner: string,
  repo: string,
  number: number,
): Promise<PullRequestDetail> {
  const octokit = await getOctokit();
  githubLog.debug({ owner, repo, number }, "getPullRequestDetail: fetching");

  const [{ data: pr }, diffResponse] = await Promise.all([
    octokit.rest.pulls.get({ owner, repo, pull_number: number }),
    octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: number,
      mediaType: { format: "diff" },
    }),
  ]);

  // With `format: "diff"` GitHub returns the raw diff as the response body,
  // even though the static types still describe the PR object.
  const rawDiff = diffResponse.data as unknown as string;
  const truncated = rawDiff.length > MAX_DIFF_CHARS;
  const diff = truncated
    ? `${rawDiff.slice(0, MAX_DIFF_CHARS)}\n\n... diff truncated (${rawDiff.length} chars total) ...`
    : rawDiff;

  githubLog.info(
    { owner, repo, number, diffChars: rawDiff.length, truncated },
    "getPullRequestDetail: fetched",
  );

  return {
    ...toSummary(pr),
    body: pr.body,
    additions: pr.additions,
    deletions: pr.deletions,
    changedFiles: pr.changed_files,
    commits: pr.commits,
    mergeable: pr.mergeable,
    diff,
  };
}

type RawPull = Awaited<ReturnType<Octokit["rest"]["pulls"]["list"]>>["data"][number];

function toSummary(pr: RawPull | RawPullDetail): PullRequestSummary {
  return {
    id: pr.id,
    number: pr.number,
    title: pr.title,
    state: pr.state === "closed" ? "closed" : "open",
    draft: pr.draft ?? false,
    authorLogin: pr.user?.login ?? "unknown",
    authorAvatarUrl: pr.user?.avatar_url ?? "",
    createdAt: pr.created_at,
    updatedAt: pr.updated_at,
    comments: "comments" in pr ? (pr.comments ?? 0) : 0,
    htmlUrl: pr.html_url,
    baseRef: pr.base.ref,
    headRef: pr.head.ref,
  };
}

type RawPullDetail = Awaited<ReturnType<Octokit["rest"]["pulls"]["get"]>>["data"];
