"use client";

//* Libraries Imports
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Check, GripVertical, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

//* Components Imports
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

//* Types Imports
import type { TaskColumnRecord } from "@/hooks/use-task-columns";

//* Utils Imports
import { cn } from "@/lib/utils";

type ManageColumnsDialogProps = {
  open: boolean;
  columns: TaskColumnRecord[];
  taskCountByColumnId: Record<string, number>;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string) => Promise<boolean>;
  onRename: (id: string, name: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onReorder: (orderedIds: string[]) => Promise<boolean>;
};

type SortableColumnProps = {
  column: TaskColumnRecord;
  taskCount: number;
  isSaving: boolean;
  onRename: (id: string, name: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
};

function SortableColumn({ column, taskCount, isSaving, onRename, onDelete }: SortableColumnProps) {
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

export default function ManageColumnsDialog({
  open,
  columns,
  taskCountByColumnId,
  isSaving,
  onOpenChange,
  onCreate,
  onRename,
  onDelete,
  onReorder,
}: ManageColumnsDialogProps) {
  const [newColumnName, setNewColumnName] = useState("");
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  async function addColumn() {
    if (await onCreate(newColumnName)) setNewColumnName("");
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = columns.findIndex((column) => column.id === active.id);
    const newIndex = columns.findIndex((column) => column.id === over.id);
    if (oldIndex >= 0 && newIndex >= 0)
      void onReorder(arrayMove(columns, oldIndex, newIndex).map((column) => column.id));
  }

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto bg-background p-6 sm:max-w-lg sm:p-8">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-[-0.04em]">Gerenciar colunas</DialogTitle>
          <DialogDescription>
            Organize as etapas do seu fluxo. Colunas com tarefas precisam ser esvaziadas antes de serem excluídas.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <Input
            value={newColumnName}
            onChange={(event) => setNewColumnName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void addColumn();
            }}
            placeholder="Nome da nova coluna"
            aria-label="Nome da nova coluna"
          />
          <Button type="button" disabled={isSaving || !newColumnName.trim()} onClick={() => void addColumn()}>
            <Plus />
            Adicionar
          </Button>
        </div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={columns.map((column) => column.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-2">
              {columns.map((column) => (
                <SortableColumn
                  key={column.id}
                  column={column}
                  taskCount={taskCountByColumnId[column.id] ?? 0}
                  isSaving={isSaving}
                  onRename={onRename}
                  onDelete={onDelete}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
        <DialogFooter className="mt-4 border-t-0 bg-transparent p-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Concluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
