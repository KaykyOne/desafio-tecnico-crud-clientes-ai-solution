"use client";

//* Components Imports
import Button from "@/components/ui/button";

//* Libraries Imports
import { ChevronLeft, ChevronRight } from "lucide-react";

//* Types Imports
import type { ToolbarProps, View } from "react-big-calendar";
import type { CalendarEvent } from "./types";

//* Utils Imports
import { cn } from "@/lib/utils";

const viewLabels: Record<View, string> = {
  month: "Mês",
  week: "Semana",
  work_week: "Semana útil",
  day: "Dia",
  agenda: "Agenda",
};

export function CalendarToolbar({ label, view, views, onNavigate, onView }: ToolbarProps<CalendarEvent>) {
  const availableViews = (Array.isArray(views) ? views : (Object.keys(views) as View[])).filter(
    (viewKey) => viewKey !== "work_week",
  );

  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => onNavigate("PREV")}
          aria-label="Período anterior"
        >
          <ChevronLeft />
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => onNavigate("TODAY")}>
          Hoje
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => onNavigate("NEXT")}
          aria-label="Próximo período"
        >
          <ChevronRight />
        </Button>
        <h2 className="ml-2 text-lg font-bold tracking-[-0.02em] text-foreground capitalize">{label}</h2>
      </div>

      <div className="flex gap-1 rounded-md border p-1">
        {availableViews.map((viewKey) => (
          <Button
            key={viewKey}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onView(viewKey)}
            className={cn("h-8 px-3", view === viewKey && "bg-accent font-bold text-accent-foreground")}
          >
            {viewLabels[viewKey]}
          </Button>
        ))}
      </div>
    </div>
  );
}
