"use client";

//* Libraries Imports
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";
import { CalendarDays, Clock3, Pencil, Trash2, User } from "lucide-react";

//* Components Imports
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

//* Types Imports
import type { TaskPriority, TaskRecord } from "@/hooks/use-tasks";

//* Utils Imports
import { cn } from "@/lib/utils";

type TaskCardProps = {
  task: TaskRecord;
  clientName?: string;
  isDragging?: boolean;
  draggableAttributes?: DraggableAttributes;
  draggableListeners?: DraggableSyntheticListeners;
  onEdit?: (task: TaskRecord) => void;
  onDelete?: (task: TaskRecord) => void;
  onQuickEdit?: (task: TaskRecord) => void;
};

const priorityLabels: Record<TaskPriority, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Urgente",
};
const priorityCardStyles: Record<TaskPriority, string> = {
  low: "border-zinc-950 bg-zinc-950 text-white dark:border-zinc-950 dark:bg-zinc-950 dark:text-white",
  medium: "border-amber-400 bg-amber-400 text-amber-950 dark:border-amber-400 dark:bg-amber-400 dark:text-amber-950",
  high: "border-red-600 bg-red-600 text-white dark:border-red-500 dark:bg-red-500 dark:text-white",
};
const priorityBadgeStyles: Record<TaskPriority, string> = {
  low: "border-white/40 bg-white/15 text-white",
  medium: "border-amber-950/30 bg-amber-950/10 text-amber-950",
  high: "border-white/40 bg-white/15 text-white",
};
const priorityMutedTextStyles: Record<TaskPriority, string> = {
  low: "text-white/75",
  medium: "text-amber-950/75",
  high: "text-white/80",
};
const priorityDividerStyles: Record<TaskPriority, string> = {
  low: "border-white/20",
  medium: "border-amber-950/20",
  high: "border-white/25",
};

function formatDueDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(`${date}T00:00:00`));
}

export default function TaskCard({
  task,
  clientName,
  isDragging,
  draggableAttributes,
  draggableListeners,
  onEdit,
  onDelete,
  onQuickEdit,
}: TaskCardProps) {
  return (
    <article
      {...draggableAttributes}
      {...draggableListeners}
      className={cn(
        "group rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring",
        priorityCardStyles[task.priority],
        draggableListeners && "cursor-grab touch-none active:cursor-grabbing",
        isDragging && "opacity-40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 font-semibold leading-snug">{task.title}</h3>
        <Badge
          variant="outline"
          {...(onQuickEdit
            ? {
                render: <button type="button" />,
                onClick: () => onQuickEdit(task),
                "aria-label": `Alterar prioridade e cliente de ${task.title}`,
                title: "Alterar prioridade e cliente",
              }
            : {})}
          className={cn(
            "shrink-0",
            priorityBadgeStyles[task.priority],
            onQuickEdit && "cursor-pointer hover:brightness-110",
          )}
        >
          {priorityLabels[task.priority]}
        </Badge>
      </div>

      {task.description && (
        <p className={cn("mt-2 line-clamp-2 text-sm leading-relaxed", priorityMutedTextStyles[task.priority])}>
          {task.description}
        </p>
      )}

      <div
        className={cn(
          "mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs",
          priorityMutedTextStyles[task.priority],
        )}
      >
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-3.5" />
          Entrega: {formatDueDate(task.due_date)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="size-3.5" />
          {task.average_duration_minutes} min
        </span>
        {clientName && (
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <User className="size-3.5 shrink-0" />
            <span className="truncate">{clientName}</span>
          </span>
        )}
      </div>

      {(onEdit || onDelete) && (
        <div
          className={cn(
            "mt-3 flex justify-end border-t pt-2 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100",
            priorityDividerStyles[task.priority],
          )}
        >
          {onEdit && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onEdit(task)}
              aria-label={`Editar ${task.title}`}
            >
              <Pencil />
            </Button>
          )}
          {onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => onDelete(task)}
              aria-label={`Excluir ${task.title}`}
            >
              <Trash2 />
            </Button>
          )}
        </div>
      )}
    </article>
  );
}
