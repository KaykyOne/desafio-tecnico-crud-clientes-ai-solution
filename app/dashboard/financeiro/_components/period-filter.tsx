"use client";

//* Components Imports
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

//* Libraries Imports
import { ChevronLeft, ChevronRight } from "lucide-react";

//* Types Imports
import type { PeriodFilter } from "@/hooks/use-financeiro";

//* Utils Imports
import { cn } from "@/lib/utils";

type PeriodFilterControlProps = {
  value: PeriodFilter;
  onChange: (value: PeriodFilter) => void;
};

function shiftMonth(month: string, delta: number) {
  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(year, monthNumber - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function PeriodFilterControl({ value, onChange }: PeriodFilterControlProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground">Período</p>
        <div className="flex gap-1 rounded-md border p-0.5">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className={cn(value.mode === "month" && "bg-accent font-bold text-accent-foreground")}
            onClick={() =>
              onChange({ mode: "month", month: value.mode === "range" ? value.start.slice(0, 7) : value.month })
            }
          >
            Mês
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className={cn(value.mode === "range" && "bg-accent font-bold text-accent-foreground")}
            onClick={() =>
              onChange(
                value.mode === "month"
                  ? { mode: "range", start: `${value.month}-01`, end: `${value.month}-01` }
                  : value,
              )
            }
          >
            Intervalo
          </Button>
        </div>
      </div>

      {value.mode === "month" ? (
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => onChange({ mode: "month", month: shiftMonth(value.month, -1) })}
            aria-label="Mês anterior"
          >
            <ChevronLeft />
          </Button>
          <Input
            type="month"
            value={value.month}
            onChange={(event) => event.target.value && onChange({ mode: "month", month: event.target.value })}
            className="h-10 flex-1 bg-background"
          />
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => onChange({ mode: "month", month: shiftMonth(value.month, 1) })}
            aria-label="Próximo mês"
          >
            <ChevronRight />
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="date"
            value={value.start}
            onChange={(event) => onChange({ mode: "range", start: event.target.value, end: value.end })}
            className="h-10 bg-background"
            aria-label="Data inicial"
          />
          <Input
            type="date"
            value={value.end}
            onChange={(event) => onChange({ mode: "range", start: value.start, end: event.target.value })}
            className="h-10 bg-background"
            aria-label="Data final"
          />
        </div>
      )}
    </div>
  );
}
