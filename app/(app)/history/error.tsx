"use client";

import { ErrorState } from "@/components/error-state";

export default function HistoryError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorState {...props} title="Couldn't load your review history" />;
}
