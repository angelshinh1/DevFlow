import "server-only";
import { cache } from "react";
import { listRepos, listOpenPullRequests, getPullRequestDetail } from "@/lib/github";
import { createClient } from "@/lib/supabase/server";
import type { SavedReview, AIReview } from "@/lib/types/review";
import type { Database } from "@/lib/types/database";

type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];

/**
 * Request-cached data accessors. React's `cache` dedupes calls within a single
 * server render so a layout + page can both ask for the same data without two
 * upstream round-trips.
 */
export const getRepos = cache(listRepos);

export const getRepoPulls = cache((owner: string, name: string) =>
  listOpenPullRequests(owner, name),
);

export const getPull = cache((owner: string, name: string, number: number) =>
  getPullRequestDetail(owner, name, number),
);

function rowToSavedReview(row: ReviewRow): SavedReview {
  const review: AIReview = {
    summary: row.ai_summary,
    bugs: row.ai_bugs,
    suggestions: row.ai_suggestions,
    severity: row.severity,
  };
  return {
    id: row.id,
    userId: row.user_id,
    repoFullName: row.repo_full_name,
    prNumber: row.pr_number,
    prTitle: row.pr_title,
    review,
    createdAt: row.created_at,
  };
}

/** All of the current user's saved reviews, newest first (RLS-scoped). */
export const getReviewHistory = cache(async (): Promise<SavedReview[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to load review history: ${error.message}`);
  return (data ?? []).map(rowToSavedReview);
});

/** The most recent saved review for a specific PR, or null if none exists. */
export const getSavedReviewForPull = cache(
  async (repoFullName: string, prNumber: number): Promise<SavedReview | null> => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("repo_full_name", repoFullName)
      .eq("pr_number", prNumber)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(`Failed to load saved review: ${error.message}`);
    return data ? rowToSavedReview(data) : null;
  },
);
