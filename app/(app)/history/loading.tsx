import { HeaderSkeleton, ListSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function HistoryLoading() {
  return (
    <>
      <HeaderSkeleton />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-5 space-y-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3 w-40" />
        </div>
        <ListSkeleton />
      </div>
    </>
  );
}
