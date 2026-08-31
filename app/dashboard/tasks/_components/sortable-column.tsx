"use client";

//* Components Imports
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

//* Libraries Imports
import { useSortable } from "@dnd-kit/sortable";
import { Check, GripVertical, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";

//* Types Imports
import type { TaskColumnRecord } from "@/hooks/use-task-columns";

//* Utils Imports
import { cn } from "@/lib/utils";

type SortableColumnProps = {
  column: TaskColumnRecord;
  taskCount: number;
  isSaving: boolean;
  onRename: (id: string, name: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
};

export function SortableColumn({ column, taskCount, isSaving, onRename, onDelete }: SortableColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(column.name);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: column.id });
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  };
  const hasTasks = taskCount > 0;

  async function saveName() {
    if (await onRename(column.id, name)) setIsEditing(false);
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-background p-2",
        isDragging && "z-10 opacity-50 shadow-lg",
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="cursor-grab text-muted-foreground active:cursor-grabbing"
        aria-label={`Reordenar ${column.name}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical />
      </Button>
      <div className="min-w-0 flex-1">
        {isEditing ? (
          <Input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void saveName();
              if (event.key === "Escape") {
                setName(column.name);
                setIsEditing(false);
              }
            }}
            className="h-8"
            aria-label={`Novo nome de ${column.name}`}
          />
        ) : (
          <>
            <p className="truncate text-sm font-medium">{column.name}</p>
            <p className="text-xs text-muted-foreground">
              {hasTasks ? `${taskCount} ${taskCount === 1 ? "tarefa" : "tarefas"}` : "Sem tarefas"}
            </p>
          </>
        )}
      </div>
      {isEditing ? (
        <>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isSaving}
            onClick={() => void saveName()}
            aria-label="Salvar nome"
          >
            <Check />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isSaving}
            onClick={() => {
              setName(column.name);
              setIsEditing(false);
            }}
            aria-label="Cancelar edição"
          >
            <X />
          </Button>
        </>
      ) : (
        <>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isSaving}
            onClick={() => setIsEditing(true)}
            aria-label={`Renomear ${column.name}`}
          >
            <Pencil />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={isSaving || hasTasks}
            title={hasTasks ? "Mova as tarefas antes de excluir esta coluna" : "Excluir coluna"}
            onClick={() => void onDelete(column.id)}
            aria-label={`Excluir ${column.name}`}
          >
            <Trash2 />
          </Button>
        </>
      )}
    </li>
  );
}
