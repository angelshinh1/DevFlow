import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { ReviewHistoryCard } from "@/components/review-history-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Stagger, FadeInItem } from "@/components/ui/motion";
import { HistoryIcon } from "@/components/ui/icons";
import { getReviewHistory } from "@/lib/data";

export const metadata: Metadata = {
  title: "Review history",
};

export default async function HistoryPage() {
  const reviews = await getReviewHistory();

  return (
    <>
      <Header>
        <h1 className="text-sm font-semibold text-fg">Review history</h1>
      </Header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold tracking-tight text-fg">Past reviews</h2>
          <p className="text-sm text-fg-muted">
            {reviews.length} saved {reviews.length === 1 ? "review" : "reviews"}.
          </p>
        </div>

        {reviews.length === 0 ? (
          <EmptyState
            icon={<HistoryIcon className="size-6" />}
            title="No reviews yet"
            description="Open a pull request and generate an AI review — it'll show up here so you can revisit it anytime."
          />
        ) : (
          <Stagger className="flex flex-col gap-3">
            {reviews.map((review) => (
              <FadeInItem key={review.id}>
                <ReviewHistoryCard review={review} />
              </FadeInItem>
            ))}
          </Stagger>
        )}
      </div>
    </>
  );
}
