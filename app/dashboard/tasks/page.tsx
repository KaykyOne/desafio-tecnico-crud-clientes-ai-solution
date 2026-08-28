"use client";

//* Libraries Imports
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Plus, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

//* Components Imports
import { Button } from "@/components/ui/button";

//* Hooks Imports
import { useClients } from "@/hooks/use-clients";
import { useTaskColumns } from "@/hooks/use-task-columns";
import { useTaskTimer } from "@/hooks/use-task-timer";
import { useTasks, type TaskRecord } from "@/hooks/use-tasks";

//* Components Imports
import DeleteTaskDialog from "./_components/delete-task-dialog";
import KanbanBoard from "./_components/kanban-board";
import ManageColumnsDialog from "./_components/manage-columns-dialog";
import TaskCard from "./_components/task-card";
import TaskFilters, { EMPTY_TASK_FILTERS, filterTasks, type TaskFilterValue } from "./_components/task-filters";
import TaskFormDialog from "./_components/task-form-dialog";
import TaskQuickEditSheet from "./_components/task-quick-edit-sheet";
import TaskTimeSummary from "./_components/task-time-summary";

export default function TasksPage() {
  const {
    tasks,
    isLoading: isLoadingTasks,
    isSaving,
    deletingTaskId,
    createTask,
    updateTask,
    updateTaskColumn,
    quickUpdateTask,
    deleteTask,
  } = useTasks();
  const { clients } = useClients();
  const {
    runningTaskId,
    runningStartedAt,
    secondsByTaskId,
    totais,
    totaisAtualizadosEm,
    isLoading: isLoadingTimer,
    isSaving: isSavingTimer,
    startTimer,
    stopTimer,
    discardTimer,
    refreshTimer,
  } = useTaskTimer();
  const {
    columns,
    isLoading: isLoadingColumns,
    isSaving: isSavingColumns,
    createColumn,
    renameColumn,
    deleteColumn,
    reorderColumns,
  } = useTaskColumns();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskRecord | null>(null);
  const [deletingTask, setDeletingTask] = useState<TaskRecord | null>(null);
  const [activeTask, setActiveTask] = useState<TaskRecord | null>(null);
  const [quickEditTaskId, setQuickEditTaskId] = useState<string | null>(null);
  const [filters, setFilters] = useState<TaskFilterValue>(EMPTY_TASK_FILTERS);
  const [isManagingColumns, setIsManagingColumns] = useState(false);
  // Mouse e toque separados de propósito: um PointerSensor único atenderia os dois pelo mesmo
  // caminho, e o `delay` que o toque precisa viraria uma espera de 220ms antes de todo arrasto no
  // desktop. Assim o mouse mantém o comportamento antigo e só o dedo precisa segurar — e a escolha
  // é por tipo de entrada, não por largura de tela (notebook com touchscreen ganha os dois).
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 6 } }),
    useSensor(KeyboardSensor),
  );

  function openCreateDialog() {
    setEditingTask(null);
    setIsFormOpen(true);
  }
  function openEditDialog(task: TaskRecord) {
    setEditingTask(task);
    setIsFormOpen(true);
  }
  function handleDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "task") setActiveTask(event.active.data.current.task as TaskRecord);
  }
  function handleDragEnd(event: DragEndEvent) {
    const overId = event.over?.id;
    const type = event.active.data.current?.type;
    setActiveTask(null);
    if (typeof overId !== "string") return;
    if (type === "column") {
      const oldIndex = columns.findIndex((column) => column.id === event.active.id);
      const newIndex = columns.findIndex((column) => column.id === overId);
      if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex)
        void reorderColumns(arrayMove(columns, oldIndex, newIndex).map((column) => column.id));
      return;
    }
    if (type === "task" && columns.some((column) => column.id === overId))
      void updateTaskColumn(String(event.active.id), overId);
  }
  const taskCountByColumnId = tasks.reduce<Record<string, number>>(
    (counts, task) => ({
      ...counts,
      [task.column_id]: (counts[task.column_id] ?? 0) + 1,
    }),
    {},
  );
  const isLoading = isLoadingTasks || isLoadingColumns;
  // Só o quadro é filtrado. `taskCountByColumnId` acima segue sobre TODAS as tarefas de propósito:
  // ele decide se uma coluna pode ser excluída, e um filtro ativo não pode mentir sobre isso.
  const visibleTasks = filterTasks(tasks, filters);
  const clientNameById = Object.fromEntries(clients.map((client) => [client.id, client.name]));
  const timerProps = {
    runningTaskId,
    runningStartedAt,
    secondsByTaskId,
    isSaving: isSavingTimer,
    onStart: (taskId: string) => void startTimer(taskId),
    onStop: () => void stopTimer(),
  };

  // A tarefa excluída leva junto suas entradas de tempo (cascade). Se a excluída for a que estava
  // rodando, sem isto sobraria um cronômetro fantasma nos totais.
  async function handleDeleteTask(id: string) {
    const success = await deleteTask(id);
    if (success) void refreshTimer();
    return success;
  }
  // Lido da lista (e não guardado em estado) pro Sheet refletir cada alteração salva na hora.
  const quickEditTask = tasks.find((task) => task.id === quickEditTaskId) ?? null;

  return (
    <section className="flex flex-col gap-8 md:h-[87vh] md:min-h-0 md:overflow-hidden">
      <div className="flex shrink-0 flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">Organização</p>
          <h1 className="text-3xl font-bold tracking-[-0.05em] text-foreground">Tarefas</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="hidden md:inline">
              Arraste as tarefas entre as colunas para acompanhar cada etapa. Use a alça no cabeçalho para reordenar as
              colunas.
            </span>
            <span className="md:hidden">
              Deslize para o lado para ver as outras colunas. Segure um card por um instante para arrastá-lo — ou use o
              botão de mover no próprio card.
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" className="h-11 px-4" onClick={() => setIsManagingColumns(true)}>
            <SlidersHorizontal />
            Gerenciar colunas
          </Button>
          <Button
            type="button"
            className="h-11 px-4 font-bold"
            disabled={isLoadingColumns || columns.length === 0}
            onClick={openCreateDialog}
          >
            <Plus />
            Nova tarefa
          </Button>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <TaskTimeSummary
          totais={totais}
          totaisAtualizadosEm={totaisAtualizadosEm}
          isRunning={runningTaskId !== null}
          isLoading={isLoadingTimer}
        />
        <TaskFilters value={filters} clients={clients} onChange={setFilters} />
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <KanbanBoard
            tasks={visibleTasks}
            columns={columns}
            clientNameById={clientNameById}
            timer={timerProps}
            isLoading={isLoading}
            onEdit={openEditDialog}
            onDelete={setDeletingTask}
            onQuickEdit={(task) => setQuickEditTaskId(task.id)}
          />
          <DragOverlay>
            {activeTask ? (
              <div className="w-[min(22rem,calc(100vw-2rem))] rotate-1 shadow-xl">
                <TaskCard
                  task={activeTask}
                  clientName={activeTask.cliente_id ? clientNameById[activeTask.cliente_id] : undefined}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
        {quickEditTask && (
          <TaskQuickEditSheet
            task={quickEditTask}
            clients={clients}
            columns={columns}
            timer={{ ...timerProps, onDiscard: () => void discardTimer() }}
            onOpenChange={(open) => {
              if (!open) setQuickEditTaskId(null);
            }}
            onPatch={quickUpdateTask}
            onMoveToColumn={updateTaskColumn}
          />
        )}
        <TaskFormDialog
          key={`${editingTask?.id ?? "new"}-${isFormOpen}`}
          open={isFormOpen}
          task={editingTask}
          columns={columns}
          clients={clients}
          isSaving={isSaving}
          onOpenChange={setIsFormOpen}
          onSubmit={(input) => (editingTask ? updateTask(editingTask.id, input) : createTask(input))}
        />
        <ManageColumnsDialog
          open={isManagingColumns}
          columns={columns}
          taskCountByColumnId={taskCountByColumnId}
          isSaving={isSavingColumns}
          onOpenChange={setIsManagingColumns}
          onCreate={createColumn}
          onRename={renameColumn}
          onDelete={deleteColumn}
          onReorder={reorderColumns}
        />
        <DeleteTaskDialog
          open={Boolean(deletingTask)}
          taskTitle={deletingTask?.title ?? ""}
          loggedSeconds={deletingTask ? (secondsByTaskId[deletingTask.id] ?? 0) : 0}
          isDeleting={Boolean(deletingTaskId)}
          onOpenChange={(open) => {
            if (!open) setDeletingTask(null);
          }}
          onConfirm={() => (deletingTask ? handleDeleteTask(deletingTask.id) : Promise.resolve(false))}
        />
      </div>
    </section >
  );
}
