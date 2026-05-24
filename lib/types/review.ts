/** AI review domain types. The Gemini output is validated against these. */

export const SEVERITIES = ["low", "medium", "high"] as const;
export type Severity = (typeof SEVERITIES)[number];

export interface ReviewBug {
  title: string;
  description: string;
  severity: Severity;
  /** File path (and optionally line range) the finding refers to, if known. */
  location: string | null;
}

export interface ReviewSuggestion {
  title: string;
  description: string;
}

/** The structured payload produced by the Gemini review pass. */
export interface AIReview {
  summary: string;
  bugs: ReviewBug[];
  suggestions: ReviewSuggestion[];
  /** Overall severity, derived from the most serious finding. */
  severity: Severity;
}

/** A persisted review row joined with its parsed AI payload. */
export interface SavedReview {
  id: string;
  userId: string;
  repoFullName: string;
  prNumber: number;
  prTitle: string;
  review: AIReview;
  createdAt: string;
}
