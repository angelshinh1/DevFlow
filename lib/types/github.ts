/** Shapes we project from the GitHub REST API — only the fields the UI needs. */

export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  description: string | null;
  private: boolean;
  language: string | null;
  stars: number;
  openIssues: number;
  defaultBranch: string;
  pushedAt: string | null;
  htmlUrl: string;
}

export type PullRequestState = "open" | "closed";

export interface PullRequestSummary {
  id: number;
  number: number;
  title: string;
  state: PullRequestState;
  draft: boolean;
  authorLogin: string;
  authorAvatarUrl: string;
  createdAt: string;
  updatedAt: string;
  comments: number;
  htmlUrl: string;
  baseRef: string;
  headRef: string;
}

export interface PullRequestDetail extends PullRequestSummary {
  body: string | null;
  additions: number;
  deletions: number;
  changedFiles: number;
  commits: number;
  /** Unified diff text for the whole PR. */
  diff: string;
  mergeable: boolean | null;
}
