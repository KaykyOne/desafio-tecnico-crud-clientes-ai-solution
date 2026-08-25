//* Components Imports
import CardSkeleton from "@/components/card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function TaskCardSkeleton() {
  return (
    <div aria-hidden="true" className="relative">
      <CardSkeleton lines={2} className="min-h-32 shadow-sm" />
      <Skeleton className="absolute top-4 right-4 h-5 w-14 rounded-full" />
    </div>
  );
}
