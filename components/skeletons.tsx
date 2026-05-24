import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

/** Skeleton mirroring the repo/PR card grid layout. */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-5">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="mt-3 h-3 w-full" />
          <Skeleton className="mt-1.5 h-3 w-4/5" />
          <div className="mt-5 flex gap-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
        </Card>
      ))}
    </div>
  );
}

/** Skeleton for vertical list rows (e.g. PRs, history). */
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="flex items-center justify-between p-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="size-7 rounded-full" />
        </Card>
      ))}
    </div>
  );
}

/** Skeleton header bar used inside loading routes. */
export function HeaderSkeleton() {
  return (
    <div className="sticky top-0 z-10 flex h-14 shrink-0 items-center border-b border-line bg-canvas/80 px-6 backdrop-blur">
      <Skeleton className="h-4 w-40" />
    </div>
  );
}
