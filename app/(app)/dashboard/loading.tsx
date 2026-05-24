import { HeaderSkeleton, CardGridSkeleton } from "@/components/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <>
      <HeaderSkeleton />
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mb-5 space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3 w-72" />
        </div>
        <CardGridSkeleton />
      </div>
    </>
  );
}
