"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { getPull } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { generateReview, ReviewGenerationError } from "@/lib/gemini";
import { GitHubAuthError } from "@/lib/github";
import { childLogger } from "@/lib/logger";
import type { AIReview } from "@/lib/types/review";

const log = childLogger("review-action");

export type GenerateReviewResult =
  | { ok: true; review: AIReview; createdAt: string }
  | { ok: false; error: string };

/**
 * Generates an AI review for a PR diff and persists it (RLS-scoped to the user).
 * Returns a serializable result so the client can update the panel in place.
 */
export async function generateReviewAction(
  owner: string,
  name: string,
  number: number,
): Promise<GenerateReviewResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Your session expired. Please sign in again." };

  const repoFullName = `${owner}/${name}`;

  try {
    const pr = await getPull(owner, name, number);

    const review = await generateReview({
      repoFullName,
      prTitle: pr.title,
      prBody: pr.body,
      diff: pr.diff,
    });

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reviews")
      .insert({
        user_id: user.id,
        repo_full_name: repoFullName,
        pr_number: number,
        pr_title: pr.title,
        ai_summary: review.summary,
        ai_bugs: review.bugs,
        ai_suggestions: review.suggestions,
        severity: review.severity,
      })
      .select("created_at")
      .single();

    if (error) {
      log.error({ err: error, repoFullName, number }, "failed to persist review");
      return { ok: false, error: "The review was generated but couldn't be saved. Please retry." };
    }

    revalidatePath(`/pr/${owner}/${name}/${number}`);
    revalidatePath("/history");

    log.info({ repoFullName, number, severity: review.severity }, "review generated + saved");
    return { ok: true, review, createdAt: data.created_at };
  } catch (err) {
    if (err instanceof GitHubAuthError) {
      return { ok: false, error: "GitHub access expired. Please sign in again." };
    }
    if (err instanceof ReviewGenerationError) {
      return { ok: false, error: err.message };
    }
    log.error({ err, repoFullName, number }, "unexpected error generating review");
    return { ok: false, error: "Something went wrong generating the review. Please try again." };
  }
}
