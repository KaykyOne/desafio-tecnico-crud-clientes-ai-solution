"use client";

//* Components Imports
import { KanbanColumn } from "./kanban-column";

//* Libraries Imports
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";

//* Types Imports
import type { TaskColumnRecord } from "@/hooks/use-task-columns";
import type { TaskRecord } from "@/hooks/use-tasks";
import type { TaskCardHandlers } from "./draggable-task-card";

//* Utils Imports
import { cn } from "@/lib/utils";

export type KanbanBoardProps = TaskCardHandlers & {
  tasks: TaskRecord[];
  columns: TaskColumnRecord[];
  clientNameById: Record<string, string>;
  isLoading: boolean;
};

export function KanbanBoard({
  tasks,
  columns,
  clientNameById,
  timer,
  isLoading,
  onEdit,
  onDelete,
  onQuickEdit,
}: KanbanBoardProps) {
  return (
    <SortableContext items={columns.map((column) => column.id)} strategy={rectSortingStrategy}>
      <div
        className={cn(
          // Rolagem lateral em qualquer tamanho: as colunas nunca quebram pra uma linha de baixo.
          "flex h-full min-h-0",
          "gap-5",
          "overflow-x-auto",
          "pb-2",

          // Snap só no mobile — no desktop ele brigaria com trackpad/shift+scroll.
          "snap-x snap-mandatory md:snap-none",
        )}
      >
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={tasks.filter((task) => task.column_id === column.id)}
            clientNameById={clientNameById}
            timer={timer}
            isLoading={isLoading}
            onEdit={onEdit}
            onDelete={onDelete}
            onQuickEdit={onQuickEdit}
          />
        ))}
      </div>
    </SortableContext>
  );
}
