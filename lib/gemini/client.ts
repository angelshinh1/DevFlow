import "server-only";
import {
  GoogleGenerativeAI,
  SchemaType,
  type GenerativeModel,
  type ResponseSchema,
} from "@google/generative-ai";
import { env } from "@/lib/env";
import { childLogger } from "@/lib/logger";
import { REVIEW_SYSTEM_INSTRUCTION } from "./prompt";

export const geminiLog = childLogger("gemini");

/** Model id per the product spec. Centralized so it's a one-line swap. */
export const REVIEW_MODEL = "gemini-3.5-flash";

/**
 * Response schema handed to Gemini so it returns strict JSON matching our
 * review shape. `location` is a plain string (empty when unknown) — we normalize
 * it to null after parsing, which avoids nullable-schema quirks in the SDK.
 */
const reviewResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    summary: {
      type: SchemaType.STRING,
      description: "2-4 sentence high-level summary of what the PR does and its overall quality.",
    },
    severity: {
      type: SchemaType.STRING,
      format: "enum",
      enum: ["low", "medium", "high"],
      description: "Overall risk of merging this PR as-is.",
    },
    bugs: {
      type: SchemaType.ARRAY,
      description: "Concrete likely bugs or correctness/security issues. Empty array if none.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          severity: {
            type: SchemaType.STRING,
            format: "enum",
            enum: ["low", "medium", "high"],
          },
          location: {
            type: SchemaType.STRING,
            description: "file path (and line if known), or empty string if not localizable",
          },
        },
        required: ["title", "description", "severity", "location"],
      },
    },
    suggestions: {
      type: SchemaType.ARRAY,
      description: "Non-blocking improvements: readability, tests, naming, performance.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
        },
        required: ["title", "description"],
      },
    },
  },
  required: ["summary", "severity", "bugs", "suggestions"],
} as const;

let cached: GenerativeModel | null = null;

/** Lazily constructs the configured review model (JSON-constrained output). */
export function getReviewModel(): GenerativeModel {
  if (cached) return cached;
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  cached = genAI.getGenerativeModel({
    model: REVIEW_MODEL,
    systemInstruction: REVIEW_SYSTEM_INSTRUCTION,
    generationConfig: {
      temperature: 0.3,
      responseMimeType: "application/json",
      responseSchema: reviewResponseSchema as unknown as ResponseSchema,
    },
  });
  return cached;
}
