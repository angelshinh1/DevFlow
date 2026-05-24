"use client";

import { ErrorState } from "@/components/error-state";

export default function RepoError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorState {...props} title="Couldn't load pull requests" />;
}
