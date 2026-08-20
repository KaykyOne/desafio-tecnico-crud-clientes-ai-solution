"use client";

//* Libraries Imports
import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, closestCorners, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Plus, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

//* Components Imports
import { Button } from "@/components/ui/button";

//* Hooks Imports
import { useTaskColumns } from "@/hooks/use-task-columns";
import { useTasks, type TaskRecord } from "@/hooks/use-tasks";

//* Components Imports
import DeleteTaskDialog from "./_components/delete-task-dialog";
import KanbanBoard from "./_components/kanban-board";
import ManageColumnsDialog from "./_components/manage-columns-dialog";
import TaskCard from "./_components/task-card";
import TaskFormDialog from "./_components/task-form-dialog";

export default function TasksPage() {
  const { tasks, isLoading: isLoadingTasks, isSaving, deletingTaskId, createTask, updateTask, updateTaskColumn, deleteTask } = useTasks();
  const { columns, isLoading: isLoadingColumns, isSaving: isSavingColumns, createColumn, renameColumn, deleteColumn, reorderColumns } = useTaskColumns();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskRecord | null>(null);
  const [deletingTask, setDeletingTask] = useState<TaskRecord | null>(null);
  const [activeTask, setActiveTask] = useState<TaskRecord | null>(null);
  const [isManagingColumns, setIsManagingColumns] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor));

  function openCreateDialog() { setEditingTask(null); setIsFormOpen(true); }
  function openEditDialog(task: TaskRecord) { setEditingTask(task); setIsFormOpen(true); }
  function handleDragStart(event: DragStartEvent) { if (event.active.data.current?.type === "task") setActiveTask(event.active.data.current.task as TaskRecord); }
  function handleDragEnd(event: DragEndEvent) { const overId = event.over?.id; const type = event.active.data.current?.type; setActiveTask(null); if (typeof overId !== "string") return; if (type === "column") { const oldIndex = columns.findIndex((column) => column.id === event.active.id); const newIndex = columns.findIndex((column) => column.id === overId); if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex) void reorderColumns(arrayMove(columns, oldIndex, newIndex).map((column) => column.id)); return; } if (type === "task" && columns.some((column) => column.id === overId)) void updateTaskColumn(String(event.active.id), overId); }
  const taskCountByColumnId = tasks.reduce<Record<string, number>>((counts, task) => ({ ...counts, [task.column_id]: (counts[task.column_id] ?? 0) + 1 }), {});
  const isLoading = isLoadingTasks || isLoadingColumns;

  return <section className="space-y-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">Organização</p><h1 className="text-3xl font-bold tracking-[-0.05em] text-foreground">Tarefas</h1><p className="mt-2 text-sm text-muted-foreground">Arraste as tarefas entre as colunas para acompanhar cada etapa. Use a alça no cabeçalho para reordenar as colunas.</p></div><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" className="h-11 px-4" onClick={() => setIsManagingColumns(true)}><SlidersHorizontal />Gerenciar colunas</Button><Button type="button" className="h-11 px-4 font-bold" disabled={isLoadingColumns || columns.length === 0} onClick={openCreateDialog}><Plus />Nova tarefa</Button></div></div><DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}><KanbanBoard tasks={tasks} columns={columns} isLoading={isLoading} onEdit={openEditDialog} onDelete={setDeletingTask} /><DragOverlay>{activeTask ? <div className="w-[min(22rem,calc(100vw-2rem))] rotate-1 shadow-xl"><TaskCard task={activeTask} /></div> : null}</DragOverlay></DndContext><TaskFormDialog key={`${editingTask?.id ?? "new"}-${isFormOpen}`} open={isFormOpen} task={editingTask} columns={columns} isSaving={isSaving} onOpenChange={setIsFormOpen} onSubmit={(input) => editingTask ? updateTask(editingTask.id, input) : createTask(input)} /><ManageColumnsDialog open={isManagingColumns} columns={columns} taskCountByColumnId={taskCountByColumnId} isSaving={isSavingColumns} onOpenChange={setIsManagingColumns} onCreate={createColumn} onRename={renameColumn} onDelete={deleteColumn} onReorder={reorderColumns} /><DeleteTaskDialog open={Boolean(deletingTask)} taskTitle={deletingTask?.title ?? ""} isDeleting={Boolean(deletingTaskId)} onOpenChange={(open) => { if (!open) setDeletingTask(null); }} onConfirm={() => deletingTask ? deleteTask(deletingTask.id) : Promise.resolve(false)} /></section>;
}
