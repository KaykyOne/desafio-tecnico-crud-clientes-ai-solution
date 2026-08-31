//* Components Imports
import Skeleton from "@/components/ui/skeleton";

//* Utils Imports
import { cn } from "@/lib/utils";

type CardSkeletonProps = {
  lines?: number;
  className?: string;
};

export function CardSkeleton({ lines = 2, className }: CardSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex flex-col gap-(--card-spacing) rounded-xl bg-card py-(--card-spacing) ring-1 ring-foreground/10 [--card-spacing:--spacing(4)]",
        className,
      )}
    >
      <Skeleton className="mx-(--card-spacing) h-5 w-3/5" />

      {lines > 0 && (
        <div className="space-y-3 px-(--card-spacing)">
          {Array.from({ length: lines }, (_, index) => (
            <Skeleton key={index} className={cn("h-4", index === lines - 1 ? "w-2/5" : "w-full")} />
          ))}
        </div>
      )}
    </div>
  );
}
