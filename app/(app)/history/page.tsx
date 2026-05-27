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

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-12 sm:px-10 sm:py-16">
          <div className="mb-12 grid gap-x-12 gap-y-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.18em] text-fg-subtle">
                Chapter II — History
              </p>
              <h2 className="font-display text-[clamp(2.25rem,4.5vw,3.5rem)] font-medium tracking-tight text-fg">
                Past <span className="editorial-em">reviews</span>.
              </h2>
            </div>
            <p className="max-w-md text-[1.02rem] leading-relaxed text-fg-muted lg:justify-self-end lg:text-right">
              {reviews.length === 0
                ? "Once you generate a review, it'll live here so you can revisit it anytime."
                : `${reviews.length} saved ${reviews.length === 1 ? "review" : "reviews"} — each one frozen at the moment it ran.`}
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
      </div>
    </>
  );
}
