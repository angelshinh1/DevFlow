import "server-only";
import { z } from "zod";
import { getReviewModel, geminiLog } from "./client";
import { buildReviewPrompt, type ReviewInput } from "./prompt";
import { SEVERITIES, type AIReview, type Severity } from "@/lib/types/review";

/** Raised when Gemini fails or returns output we can't trust. */
export class ReviewGenerationError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "ReviewGenerationError";
  }
}

const severitySchema = z.enum(SEVERITIES);

/** Validates the model's JSON. `location` arrives as a string; we normalize later. */
const modelOutputSchema = z.object({
  summary: z.string().min(1),
  severity: severitySchema,
  bugs: z.array(
    z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      severity: severitySchema,
      location: z.string().default(""),
    }),
  ),
  suggestions: z.array(
    z.object({
      title: z.string().min(1),
      description: z.string().min(1),
    }),
  ),
});

const SEVERITY_RANK: Record<Severity, number> = { low: 0, medium: 1, high: 2 };

/** Overall severity = the most serious bug, falling back to the model's call. */
function deriveSeverity(bugs: { severity: Severity }[], modelSeverity: Severity): Severity {
  if (bugs.length === 0) return "low";
  return bugs.reduce<Severity>(
    (worst, b) => (SEVERITY_RANK[b.severity] > SEVERITY_RANK[worst] ? b.severity : worst),
    modelSeverity,
  );
}

/**
 * Generates a structured AI review for a pull request diff. Validates the model
 * output against {@link modelOutputSchema} and throws {@link ReviewGenerationError}
 * on any failure so callers can surface a clean error state.
 */
export async function generateReview(input: ReviewInput): Promise<AIReview> {
  const model = getReviewModel();
  const prompt = buildReviewPrompt(input);

  geminiLog.debug(
    { repo: input.repoFullName, title: input.prTitle, diffChars: input.diff.length },
    "generateReview: requesting",
  );

  let rawText: string;
  try {
    const result = await model.generateContent(prompt);
    rawText = result.response.text();
  } catch (cause) {
    geminiLog.error({ err: cause }, "generateReview: Gemini request failed");
    throw new ReviewGenerationError("The AI review service is unavailable. Please try again.", cause);
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawText);
  } catch (cause) {
    geminiLog.error({ rawText }, "generateReview: model returned non-JSON");
    throw new ReviewGenerationError("The AI returned an unreadable response.", cause);
  }

  const validated = modelOutputSchema.safeParse(parsedJson);
  if (!validated.success) {
    geminiLog.error({ issues: validated.error.issues }, "generateReview: schema validation failed");
    throw new ReviewGenerationError("The AI response did not match the expected format.");
  }

  const { summary, bugs, suggestions, severity } = validated.data;
  const review: AIReview = {
    summary,
    bugs: bugs.map((b) => ({
      title: b.title,
      description: b.description,
      severity: b.severity,
      location: b.location.trim() || null,
    })),
    suggestions,
    severity: deriveSeverity(bugs, severity),
  };

  geminiLog.info(
    { repo: input.repoFullName, bugs: review.bugs.length, severity: review.severity },
    "generateReview: completed",
  );

  return review;
}
