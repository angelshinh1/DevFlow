import type { Severity } from "./review";

/**
 * Hand-written Supabase schema types. Kept in sync with the SQL migration in
 * supabase/migrations. (Can be regenerated later with `supabase gen types`.)
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          github_username: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          github_username?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          github_username?: string | null;
          avatar_url?: string | null;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          user_id: string;
          repo_full_name: string;
          pr_number: number;
          pr_title: string;
          ai_summary: string;
          ai_bugs: ReviewBugJson[];
          ai_suggestions: ReviewSuggestionJson[];
          severity: Severity;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          repo_full_name: string;
          pr_number: number;
          pr_title: string;
          ai_summary: string;
          ai_bugs: ReviewBugJson[];
          ai_suggestions: ReviewSuggestionJson[];
          severity: Severity;
          created_at?: string;
        };
        Update: {
          pr_title?: string;
          ai_summary?: string;
          ai_bugs?: ReviewBugJson[];
          ai_suggestions?: ReviewSuggestionJson[];
          severity?: Severity;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      severity: Severity;
    };
    CompositeTypes: Record<string, never>;
  };
}

/** JSONB column shapes (mirror ReviewBug / ReviewSuggestion). */
export interface ReviewBugJson {
  title: string;
  description: string;
  severity: Severity;
  location: string | null;
}

export interface ReviewSuggestionJson {
  title: string;
  description: string;
}
