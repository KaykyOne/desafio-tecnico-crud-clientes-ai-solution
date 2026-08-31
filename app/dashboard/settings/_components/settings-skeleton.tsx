//* Components Imports
import Skeleton from "@/components/ui/skeleton";

import { LabelSkeleton } from "@/components/label-skeleton";

export function SettingsSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Carregando dados da conta"
      className="rounded-xl border bg-card p-6 shadow-sm sm:p-8"
    >
      <div className="max-w-xl space-y-5">
        <LabelSkeleton />
        <LabelSkeleton />
        <LabelSkeleton />

        <div className="flex justify-end pt-2">
          <Skeleton className="h-11 w-40" />
        </div>
      </div>
    </div>
  );
}
