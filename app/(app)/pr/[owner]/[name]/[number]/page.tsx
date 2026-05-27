import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header, Breadcrumb } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { DiffViewer } from "@/components/pr/diff-viewer";
import { ReviewPanel } from "@/components/pr/review-panel";
import { FadeIn } from "@/components/ui/motion";
import { getPull, getSavedReviewForPull } from "@/lib/data";

interface PRPageProps {
  params: Promise<{ owner: string; name: string; number: string }>;
}

function parseNumber(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export async function generateMetadata({ params }: PRPageProps): Promise<Metadata> {
  const { owner, name, number } = await params;
  return { title: `${owner}/${name} #${number}` };
}

export default async function PRPage({ params }: PRPageProps) {
  const { owner, name, number: rawNumber } = await params;
  const number = parseNumber(rawNumber);
  if (number === null) notFound();

  const repoFullName = `${owner}/${name}`;
  const [pr, saved] = await Promise.all([
    getPull(owner, name, number),
    getSavedReviewForPull(repoFullName, number),
  ]);

  return (
    <>
      <Header
        actions={
          <a href={pr.htmlUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm">
              View on GitHub
            </Button>
          </a>
        }
      >
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: repoFullName, href: `/repo/${owner}/${name}` },
            { label: `#${number}` },
          ]}
        />
      </Header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-x-10 gap-y-8 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(380px,420px)]">
          {/* Left: PR metadata + diff */}
          <div className="flex min-w-0 flex-col gap-8">
            <FadeIn>
              <div>
                <div className="flex items-center gap-3">
                  {pr.draft ? (
                    <Badge variant="draft">Draft</Badge>
                  ) : (
                    <Badge variant="open" dot>
                      Open
                    </Badge>
                  )}
                  <span className="font-mono text-xs text-fg-subtle">#{pr.number}</span>
                </div>

                <h1 className="mt-4 font-display text-[clamp(1.875rem,3.6vw,2.75rem)] font-medium leading-[1.1] tracking-tight text-fg">
                  {pr.title}
                </h1>

                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-fg-subtle">
                  <span className="inline-flex items-center gap-2">
                    <Avatar src={pr.authorAvatarUrl} alt={pr.authorLogin} size={20} />
                    <span className="text-fg-muted">{pr.authorLogin}</span>
                  </span>
                  <span className="font-mono">
                    {pr.baseRef} ← {pr.headRef}
                  </span>
                  <span>
                    <span className="text-[var(--color-diff-add-fg)]">+{pr.additions}</span>{" "}
                    <span className="text-[var(--color-diff-del-fg)]">−{pr.deletions}</span>
                  </span>
                  <span>
                    {pr.changedFiles} {pr.changedFiles === 1 ? "file" : "files"} changed
                  </span>
                </div>
              </div>
            </FadeIn>

            {pr.body?.trim() && (
              <FadeIn delay={0.05}>
                <div className="rounded-[var(--radius-card)] border border-line bg-surface p-6 card-shadow">
                  <p className="font-display text-xs uppercase tracking-[0.18em] text-fg-subtle">
                    Description
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-[0.95rem] leading-relaxed text-fg-muted">
                    {pr.body.trim()}
                  </p>
                </div>
              </FadeIn>
            )}

            <FadeIn delay={0.1}>
              <div>
                <p className="mb-3 font-display text-xs uppercase tracking-[0.18em] text-fg-subtle">
                  Changes
                </p>
                <DiffViewer diff={pr.diff} />
              </div>
            </FadeIn>
          </div>

          {/* Right: AI review panel, sticky on desktop */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <FadeIn delay={0.15}>
              <ReviewPanel
                owner={owner}
                name={name}
                number={number}
                initialReview={saved?.review ?? null}
                initialCreatedAt={saved?.createdAt ?? null}
              />
            </FadeIn>
          </div>
        </div>
      </div>
    </>
  );
}
