"use client";

//* Components Imports
import Button from "@/components/ui/button";

import { DraggableTaskCard } from "./draggable-task-card";
import { TaskCardSkeleton } from "./task-card-skeleton";

//* Libraries Imports
import { useSortable } from "@dnd-kit/sortable";
import { Columns3, GripVertical } from "lucide-react";

//* Types Imports
import type { TaskColumnRecord } from "@/hooks/use-task-columns";
import type { TaskRecord } from "@/hooks/use-tasks";
import type { TaskCardHandlers } from "./draggable-task-card";

//* Utils Imports
import { cn } from "@/lib/utils";

type KanbanColumnProps = TaskCardHandlers & {
  column: TaskColumnRecord;
  tasks: TaskRecord[];
  clientNameById: Record<string, string>;
  isLoading: boolean;
};

export function KanbanColumn({
  column,
  tasks,
  clientNameById,
  timer,
  isLoading,
  onEdit,
  onDelete,
  onQuickEdit,
}: KanbanColumnProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } = useSortable({
    id: column.id,
    data: {
      type: "column",
    },
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  };

  return (
    <section
      ref={setNodeRef}
      style={{
        ...style,
        borderLeftColor: column.color ?? "var(--foreground)",
      }}
      className={cn(
        // Mobile: coluna tipo slide, ocupando quase a tela toda.
        // Desktop: cresce pra preencher a largura quando há poucas colunas, mas nunca abaixo de
        // 18rem — quando não couberem todas, o piso é o que empurra a rolagem lateral.
        "w-[min(85vw,20rem)] shrink-0 snap-start",
        "md:w-auto md:min-w-[18rem] md:flex-1 md:shrink",

        // Estrutura principal da coluna.
        "flex min-h-[24rem] flex-col overflow-hidden",
        "rounded-2xl border border-l-4 bg-muted/45",
        "p-3 sm:p-4",

        // No desktop a coluna deve respeitar exatamente a altura disponibilizada pelo pai.
        "md:h-full md:min-h-0",

        "transition-[transform,background-color,border-color]",

        isOver && "border-foreground/35 bg-muted",
        isDragging && "z-10 opacity-60 shadow-xl",
      )}
      aria-label={`${column.name}: ${tasks.length} tarefas`}
    >
      {/* Header fica fora da área de scroll */}
      <header className="mb-4 flex shrink-0 items-start justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-background text-muted-foreground">
            <Columns3 className="size-4" />
          </span>

          <div>
            <h2 className="text-sm font-bold">{column.name}</h2>
            <p className="text-xs text-muted-foreground">
              {tasks.length === 1 ? "1 tarefa" : `${tasks.length} tarefas`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span className="flex size-6 items-center justify-center rounded-full bg-background text-xs font-semibold text-muted-foreground">
            {isLoading ? "—" : tasks.length}
          </span>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="cursor-grab text-muted-foreground active:cursor-grabbing"
            aria-label={`Arrastar coluna ${column.name}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical />
          </Button>
        </div>
      </header>

      {/* Somente essa área rola */}
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-3",
          "overflow-y-auto",
          "[scrollbar-width:none]",
          "[&::-webkit-scrollbar]:hidden",
        )}
      >
        {isLoading ? (
          Array.from({ length: 3 }, (_, index) => <TaskCardSkeleton key={index} />)
        ) : tasks.length ? (
          tasks.map((task) => (
            <DraggableTaskCard
              key={task.id}
              task={task}
              clientName={task.cliente_id ? clientNameById[task.cliente_id] : undefined}
              timer={timer}
              onEdit={onEdit}
              onDelete={onDelete}
              onQuickEdit={onQuickEdit}
            />
          ))
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed bg-background/60 px-4 py-10 text-center text-sm text-muted-foreground">
            Nenhuma tarefa nesta coluna.
          </div>
        )}
      </div>
    </section>
  );
}
