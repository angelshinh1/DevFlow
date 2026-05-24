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
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,400px)]">
          {/* Left: PR metadata + diff */}
          <div className="flex min-w-0 flex-col gap-5">
            <FadeIn>
              <div>
                <div className="flex items-center gap-2">
                  {pr.draft ? (
                    <Badge variant="draft">Draft</Badge>
                  ) : (
                    <Badge variant="open" dot>
                      Open
                    </Badge>
                  )}
                  <span className="text-xs text-fg-subtle">#{pr.number}</span>
                </div>
                <h1 className="mt-2 text-xl font-semibold tracking-tight text-fg">{pr.title}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-fg-subtle">
                  <span className="inline-flex items-center gap-1.5">
                    <Avatar src={pr.authorAvatarUrl} alt={pr.authorLogin} size={18} />
                    {pr.authorLogin}
                  </span>
                  <span className="font-mono">
                    {pr.baseRef} ← {pr.headRef}
                  </span>
                  <span className="text-[var(--color-diff-add-fg)]">+{pr.additions}</span>
                  <span className="text-[var(--color-diff-del-fg)]">−{pr.deletions}</span>
                  <span>
                    {pr.changedFiles} {pr.changedFiles === 1 ? "file" : "files"} changed
                  </span>
                </div>
              </div>
            </FadeIn>

            {pr.body?.trim() && (
              <FadeIn delay={0.05}>
                <div className="rounded-[var(--radius-card)] border border-line bg-surface p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-fg-muted">
                    {pr.body.trim()}
                  </p>
                </div>
              </FadeIn>
            )}

            <FadeIn delay={0.1}>
              <DiffViewer diff={pr.diff} />
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
