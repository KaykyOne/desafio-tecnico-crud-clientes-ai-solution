//* Components Imports
import Skeleton from "@/components/ui/skeleton";

import { CardSkeleton } from "@/components/card-skeleton";

const tableColumnWidths = ["w-4/5", "w-3/4", "w-16", "w-2/3", "ml-auto w-16"];

export function ClientsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando clientes" className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <CardSkeleton lines={1} className="min-h-30" />
        <CardSkeleton lines={1} className="min-h-30" />
        <CardSkeleton lines={1} className="min-h-30" />
      </div>

      <div className="space-y-4 rounded-xl border bg-card p-4 shadow-sm sm:p-5">
        <Skeleton className="h-11 w-full" />

        <div className="overflow-x-auto">
          <div className="min-w-175">
            {Array.from({ length: 5 }, (_, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-5 gap-4 border-b px-3 py-4 last:border-b-0">
                {tableColumnWidths.map((width, columnIndex) => (
                  <Skeleton key={columnIndex} className={`h-4 ${width}`} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
