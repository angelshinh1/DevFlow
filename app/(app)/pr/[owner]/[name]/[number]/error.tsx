"use client";

import { ErrorState } from "@/components/error-state";

export default function PRError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorState {...props} title="Couldn't load this pull request" />;
}
