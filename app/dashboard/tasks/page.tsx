"use client";

//* Libraries Imports
import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, closestCorners, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { useState } from "react";

//* Components Imports
import { Button } from "@/components/ui/button";

//* Hooks Imports
import { useTasks, type TaskRecord, type TaskStatus } from "@/hooks/use-tasks";

import DeleteTaskDialog from "./_components/delete-task-dialog";
import KanbanBoard from "./_components/kanban-board";
import TaskCard from "./_components/task-card";
import TaskFormDialog from "./_components/task-form-dialog";

const statuses: TaskStatus[] = ["pending", "in_progress", "completed"];

export default function TasksPage() {
  const { tasks, isLoading, isSaving, deletingTaskId, createTask, updateTask, updateTaskStatus, deleteTask } = useTasks();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskRecord | null>(null);
  const [deletingTask, setDeletingTask] = useState<TaskRecord | null>(null);
  const [activeTask, setActiveTask] = useState<TaskRecord | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor));

  function openCreateDialog() { setEditingTask(null); setIsFormOpen(true); }
  function openEditDialog(task: TaskRecord) { setEditingTask(task); setIsFormOpen(true); }
  function handleDragStart(event: DragStartEvent) { setActiveTask(event.active.data.current?.task as TaskRecord | null); }
  function handleDragEnd(event: DragEndEvent) { const status = event.over?.id; setActiveTask(null); if (typeof status === "string" && statuses.includes(status as TaskStatus)) void updateTaskStatus(String(event.active.id), status as TaskStatus); }

  return <section className="space-y-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">Organização</p><h1 className="text-3xl font-bold tracking-[-0.05em] text-foreground">Tarefas</h1><p className="mt-2 text-sm text-muted-foreground">Arraste as tarefas entre as colunas para acompanhar cada etapa.</p></div><Button type="button" className="h-11 px-4 font-bold" onClick={openCreateDialog}><Plus />Nova tarefa</Button></div><DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}><KanbanBoard tasks={tasks} isLoading={isLoading} onEdit={openEditDialog} onDelete={setDeletingTask} /><DragOverlay>{activeTask ? <div className="w-[min(22rem,calc(100vw-2rem))] rotate-1 shadow-xl"><TaskCard task={activeTask} /></div> : null}</DragOverlay></DndContext><TaskFormDialog key={`${editingTask?.id ?? "new"}-${isFormOpen}`} open={isFormOpen} task={editingTask} isSaving={isSaving} onOpenChange={setIsFormOpen} onSubmit={(input) => editingTask ? updateTask(editingTask.id, input) : createTask(input)} /><DeleteTaskDialog open={Boolean(deletingTask)} taskTitle={deletingTask?.title ?? ""} isDeleting={Boolean(deletingTaskId)} onOpenChange={(open) => { if (!open) setDeletingTask(null); }} onConfirm={() => deletingTask ? deleteTask(deletingTask.id) : Promise.resolve(false)} /></section>;
}
