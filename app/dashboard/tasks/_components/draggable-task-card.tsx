"use client";

//* Components Imports
import { TaskCard } from "./task-card";

//* Libraries Imports
import { useDraggable } from "@dnd-kit/core";

//* Types Imports
import type { TaskRecord } from "@/hooks/use-tasks";
import type { TaskTimerProps } from "./task-card";

/**
 * Callbacks que atravessam board → coluna → card.
 *
 * Declarados aqui, no nível mais profundo, pra dependência de tipos fluir numa direção só e não
 * criar import circular entre os três arquivos.
 */
export type TaskCardHandlers = {
  timer: TaskTimerProps;
  onEdit: (task: TaskRecord) => void;
  onDelete: (task: TaskRecord) => void;
  onQuickEdit: (task: TaskRecord) => void;
};

type DraggableTaskCardProps = TaskCardHandlers & {
  task: TaskRecord;
  clientName?: string;
};

export function DraggableTaskCard({ task, clientName, timer, onEdit, onDelete, onQuickEdit }: DraggableTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: {
      type: "task",
      task,
    },
  });

  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <div ref={setNodeRef} style={style}>
      <TaskCard
        task={task}
        clientName={clientName}
        timer={timer}
        isDragging={isDragging}
        draggableAttributes={attributes}
        draggableListeners={listeners}
        onEdit={onEdit}
        onDelete={onDelete}
        onQuickEdit={onQuickEdit}
      />
    </div>
  );
}
