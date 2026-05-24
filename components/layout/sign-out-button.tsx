"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { SignOutIcon } from "@/components/ui/icons";

/** Signs the user out client-side, then hard-navigates to /login. */
export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    // Hit the route handler so the server clears the persisted GitHub cookie too.
    router.push("/auth/signout");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={pending}
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg disabled:opacity-50",
        className,
      )}
    >
      <SignOutIcon className="size-3.5" />
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
