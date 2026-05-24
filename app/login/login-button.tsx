"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { GitHubIcon } from "@/components/ui/icons";

/** GitHub OAuth scopes: read PRs/diffs on the user's repos and basic profile. */
const GITHUB_SCOPES = "read:user repo";

export function LoginButton() {
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setPending(true);
    setError(null);

    const next = searchParams.get("next") ?? "/dashboard";
    const callback = new URL("/auth/callback", window.location.origin);
    callback.searchParams.set("next", next);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: callback.toString(),
        scopes: GITHUB_SCOPES,
      },
    });

    if (error) {
      setError("Could not start GitHub sign-in. Please try again.");
      setPending(false);
    }
    // On success the browser is redirected to GitHub — no further UI needed.
  }

  return (
    <div className="flex flex-col gap-3">
      <Button variant="primary" size="md" loading={pending} onClick={signIn} className="w-full">
        {!pending && <GitHubIcon className="size-4" />}
        Continue with GitHub
      </Button>
      {error && (
        <p className="text-center text-xs text-[var(--color-sev-high)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
