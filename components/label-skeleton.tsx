//* Components Imports
import { Skeleton } from "@/components/ui/skeleton";

//* Utils Imports
import { cn } from "@/lib/utils";

type LabelSkeletonProps = {
  className?: string;
};

export default function LabelSkeleton({ className }: LabelSkeletonProps) {
  return (
    <div aria-hidden="true" className={cn("space-y-2", className)}>
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-11 w-full" />
    </div>
  );
}
