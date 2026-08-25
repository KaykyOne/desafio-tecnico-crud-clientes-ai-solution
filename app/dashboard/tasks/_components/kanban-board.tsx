"use client";

//* Libraries Imports
import { useDraggable } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { Columns3, GripVertical } from "lucide-react";

//* Components Imports
import { Button } from "@/components/ui/button";

//* Types Imports
import type { TaskColumnRecord } from "@/hooks/use-task-columns";
import type { TaskRecord } from "@/hooks/use-tasks";

//* Utils Imports
import { cn } from "@/lib/utils";

import TaskCard from "./task-card";
import TaskCardSkeleton from "./task-card-skeleton";

type KanbanBoardProps = {
  tasks: TaskRecord[];
  columns: TaskColumnRecord[];
  isLoading: boolean;
  onEdit: (task: TaskRecord) => void;
  onDelete: (task: TaskRecord) => void;
};

function DraggableTaskCard({
  task,
  onEdit,
  onDelete,
}: Omit<KanbanBoardProps, "tasks" | "columns" | "isLoading"> & {
  task: TaskRecord;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { type: "task", task },
  });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <div ref={setNodeRef} style={style}>
      <TaskCard
        task={task}
        isDragging={isDragging}
        draggableAttributes={attributes}
        draggableListeners={listeners}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}

function KanbanColumn({
  column,
  tasks,
  isLoading,
  onEdit,
  onDelete,
}: { column: TaskColumnRecord; tasks: TaskRecord[] } & Omit<KanbanBoardProps, "tasks" | "columns">) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } = useSortable({
    id: column.id,
    data: { type: "column" },
  });
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  };

  return (
    <section
      ref={setNodeRef}
      style={{ ...style, borderLeftColor: column.color ?? "var(--foreground)" }}
      className={cn(
        "flex min-h-[24rem] flex-col rounded-2xl border border-l-4 bg-muted/45 p-3 transition-[transform,background-color,border-color] sm:p-4",
        isOver && "border-foreground/35 bg-muted",
        isDragging && "z-10 opacity-60 shadow-xl",
      )}
      aria-label={`${column.name}: ${tasks.length} tarefas`}
    >
      <header className="mb-4 flex items-start justify-between gap-3 px-1">
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
      <div className="flex flex-1 flex-col gap-3">
        {isLoading ? (
          Array.from({ length: 3 }, (_, index) => <TaskCardSkeleton key={index} />)
        ) : tasks.length ? (
          tasks.map((task) => <DraggableTaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />)
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed bg-background/60 px-4 py-10 text-center text-sm text-muted-foreground">
            Nenhuma tarefa nesta coluna.
          </div>
        )}
      </div>
    </section>
  );
}

export default function KanbanBoard({ tasks, columns, isLoading, onEdit, onDelete }: KanbanBoardProps) {
  return (
    <SortableContext items={columns.map((column) => column.id)} strategy={rectSortingStrategy}>
      <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(18rem,1fr))]">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={tasks.filter((task) => task.column_id === column.id)}
            isLoading={isLoading}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </SortableContext>
  );
}
