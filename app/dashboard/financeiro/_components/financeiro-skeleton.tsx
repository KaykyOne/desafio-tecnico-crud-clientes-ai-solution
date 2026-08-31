//* Components Imports
import { CardSkeleton } from "@/components/card-skeleton";

export function FinanceiroSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <CardSkeleton key={index} lines={1} className="p-4" />
      ))}
    </div>
  );
}
