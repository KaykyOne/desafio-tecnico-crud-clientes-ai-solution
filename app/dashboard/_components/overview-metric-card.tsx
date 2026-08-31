"use client";

//* Components Imports
import Skeleton from "@/components/ui/skeleton";

//* Libraries Imports
import { ChevronRight } from "lucide-react";

//* Utils Imports
import { cn } from "@/lib/utils";

type OverviewMetricCardProps = {
  label: string;
  /** Valor já formatado. Quando `null`, o card mostra `emptyLabel` e não abre nada. */
  value: string | null;
  emptyLabel: string;
  hint?: string;
  isLoading: boolean;
  valueClassName?: string;
  onOpen?: () => void;
};

export function OverviewMetricCard({
  label,
  value,
  emptyLabel,
  hint,
  isLoading,
  valueClassName,
  onOpen,
}: OverviewMetricCardProps) {
  const isEmpty = value === null;
  const isClickable = Boolean(onOpen) && !isEmpty && !isLoading;

  const content = (
    <>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>

      {isLoading ? (
        <Skeleton className="mt-3 h-9 w-32" />
      ) : (
        <p
          className={cn(
            "mt-3 text-3xl font-semibold tracking-[-0.03em] tabular-nums",
            isEmpty ? "text-lg font-normal text-muted-foreground" : valueClassName,
          )}
        >
          {isEmpty ? emptyLabel : value}
        </p>
      )}

      {hint && !isLoading && !isEmpty && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}

      {isClickable && (
        <ChevronRight className="absolute top-5 right-4 size-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
      )}
    </>
  );

  const className = "relative rounded-2xl border bg-card p-5 text-left";

  if (!isClickable) return <div className={className}>{content}</div>;

  return (
    <button type="button" onClick={onOpen} className={cn(className, "group transition-colors hover:bg-accent/40")}>
      {content}
    </button>
  );
}
