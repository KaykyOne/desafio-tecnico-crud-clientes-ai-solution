"use client";

//* Components Imports
import Button from "@/components/ui/button";

//* Libraries Imports
import { CalendarRange, ChevronLeft, ChevronRight, PlusCircle, X } from "lucide-react";

//* Utils Imports
import { formatWeekRange, getWeekStart, shiftWeek } from "@/lib/task-filters";

type WeekFilterProps = {
  weekStart: string | null;
  onChange: (weekStart: string | null) => void;
};

/** Filtro por semana de entrega, navegável. A semana começa no domingo. */
export function WeekFilter({ weekStart, onChange }: WeekFilterProps) {
  if (!weekStart) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 border-dashed"
        onClick={() => onChange(getWeekStart(new Date()))}
      >
        <PlusCircle />
        Semana
      </Button>
    );
  }

  const isCurrentWeek = weekStart === getWeekStart(new Date());

  return (
    <div className="flex h-9 items-center gap-0.5 rounded-md border px-1">
      <CalendarRange className="mx-1 size-4 shrink-0 text-muted-foreground" />

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => onChange(shiftWeek(weekStart, -1))}
        aria-label="Semana anterior"
      >
        <ChevronLeft />
      </Button>

      <span className="min-w-[6.5rem] text-center text-xs font-semibold tabular-nums">
        {isCurrentWeek ? "Esta semana" : formatWeekRange(weekStart)}
      </span>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => onChange(shiftWeek(weekStart, 1))}
        aria-label="Próxima semana"
      >
        <ChevronRight />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => onChange(null)}
        aria-label="Remover filtro de semana"
      >
        <X />
      </Button>
    </div>
  );
}
