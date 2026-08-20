"use client";

//* Libraries Imports
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";
import { CalendarDays, Clock3, Pencil, Trash2 } from "lucide-react";

//* Components Imports
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

//* Types Imports
import type { TaskPriority, TaskRecord } from "@/hooks/use-tasks";

//* Utils Imports
import { cn } from "@/lib/utils";

type TaskCardProps = {
  task: TaskRecord;
  isDragging?: boolean;
  draggableAttributes?: DraggableAttributes;
  draggableListeners?: DraggableSyntheticListeners;
  onEdit?: (task: TaskRecord) => void;
  onDelete?: (task: TaskRecord) => void;
};

const priorityLabels: Record<TaskPriority, string> = { low: "Baixa", medium: "Média", high: "Alta" };
const priorityStyles: Record<TaskPriority, string> = {
  low: "border-sky-200 bg-sky-50 text-sky-800",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  high: "border-rose-200 bg-rose-50 text-rose-800",
};

function formatDueDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(`${date}T00:00:00`));
}

export default function TaskCard({ task, isDragging, draggableAttributes, draggableListeners, onEdit, onDelete }: TaskCardProps) {
  return (
    <article
      {...draggableAttributes}
      {...draggableListeners}
      className={cn(
        "group rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring",
        draggableListeners && "cursor-grab touch-none active:cursor-grabbing",
        isDragging && "opacity-40"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 font-semibold leading-snug text-foreground">{task.title}</h3>
        <Badge variant="outline" className={cn("shrink-0", priorityStyles[task.priority])}>{priorityLabels[task.priority]}</Badge>
      </div>

      {task.description && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{task.description}</p>}

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5" />Entrega: {formatDueDate(task.due_date)}</span>
        <span className="inline-flex items-center gap-1.5"><Clock3 className="size-3.5" />{task.average_duration_minutes} min</span>
      </div>

      {(onEdit || onDelete) && (
        <div className="mt-3 flex justify-end border-t pt-2 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          {onEdit && <Button type="button" variant="ghost" size="icon-sm" onClick={() => onEdit(task)} aria-label={`Editar ${task.title}`}><Pencil /></Button>}
          {onDelete && <Button type="button" variant="ghost" size="icon-sm" onClick={() => onDelete(task)} aria-label={`Excluir ${task.title}`}><Trash2 /></Button>}
        </div>
      )}
    </article>
  );
}
