import { HeaderSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function PRLoading() {
  return (
    <>
      <HeaderSkeleton />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,400px)]">
          <div className="flex flex-col gap-5">
            <div className="space-y-3">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
          <Skeleton className="h-80 w-full rounded-[var(--radius-card)]" />
        </div>
      </div>
    </>
  );
}
