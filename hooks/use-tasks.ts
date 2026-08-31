"use client";

//* Libraries Imports
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

//* Services Imports
import { get, patch, post, remove } from "@/services/api-service";
import { getAuthenticatedUserId } from "@/services/auth-service";

//* Utils Imports
import { getApiErrorMessage } from "@/lib/api-error";

export type TaskPriority = "low" | "medium" | "high";

export type TaskRecord = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  column_id: string;
  cliente_id: string | null;
  average_duration_minutes: number;
  due_date: string;
  created_at: string;
  updated_at: string;
};

export type TaskInput = {
  title: string;
  description: string;
  priority: TaskPriority;
  column_id: string;
  cliente_id: string | null;
  average_duration_minutes: number;
  due_date: string;
};

/** Campos editáveis direto no card, sem abrir o formulário completo. */
export type TaskQuickPatch = Partial<Pick<TaskRecord, "priority" | "cliente_id">>;

const SELECT_COLUMNS =
  "id, user_id, title, description, priority, column_id, cliente_id, average_duration_minutes, due_date, created_at, updated_at";

export function useTasks() {
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);

    try {
      const userId = await getAuthenticatedUserId();
      const data = await get<TaskRecord>("tasks", {
        select: SELECT_COLUMNS,
        filters: { user_id: userId },
        order: [{ column: "created_at", ascending: false }],
      });
      setTasks(data);
    } catch (error) {
      toast.error("Não foi possível carregar as tarefas", {
        description: getApiErrorMessage(error, "Tente atualizar a página novamente."),
      });
      console.error("Erro ao listar tarefas:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // The initial request owns its loading state inside fetchTasks.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchTasks();
  }, [fetchTasks]);

  async function createTask(input: TaskInput) {
    setIsSaving(true);

    try {
      const userId = await getAuthenticatedUserId();
      await post("tasks", { ...input, user_id: userId });
      await fetchTasks();
      toast.success("Tarefa cadastrada");
      return true;
    } catch (error) {
      toast.error("Não foi possível cadastrar a tarefa", {
        description: getApiErrorMessage(error, "Confira os dados e tente novamente."),
      });
      console.error("Erro ao cadastrar tarefa:", error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function updateTask(id: string, input: TaskInput) {
    setIsSaving(true);

    try {
      const userId = await getAuthenticatedUserId();
      await patch("tasks", input, { id: id, user_id: userId });
      await fetchTasks();
      toast.success("Tarefa atualizada");
      return true;
    } catch (error) {
      toast.error("Não foi possível atualizar a tarefa", {
        description: getApiErrorMessage(error, "Confira os dados e tente novamente."),
      });
      console.error("Erro ao atualizar tarefa:", error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function updateTaskColumn(id: string, columnId: string) {
    const previousTasks = tasks;
    const task = previousTasks.find((currentTask) => currentTask.id === id);

    if (!task || task.column_id === columnId) return true;

    setTasks((currentTasks) =>
      currentTasks.map((currentTask) =>
        currentTask.id === id ? { ...currentTask, column_id: columnId } : currentTask,
      ),
    );

    try {
      const userId = await getAuthenticatedUserId();
      await patch("tasks", { column_id: columnId }, { id: id, user_id: userId });
      return true;
    } catch (error) {
      setTasks(previousTasks);
      toast.error("Não foi possível mover a tarefa", {
        description: getApiErrorMessage(error, "A alteração foi desfeita. Tente novamente."),
      });
      console.error("Erro ao atualizar coluna da tarefa:", error);
      return false;
    }
  }

  /** Atualiza prioridade/cliente direto do card (Sheet de edição rápida), sem recarregar a lista inteira. */
  async function quickUpdateTask(id: string, changes: TaskQuickPatch) {
    const previousTasks = tasks;
    const task = previousTasks.find((currentTask) => currentTask.id === id);

    if (!task) return false;
    if (Object.entries(changes).every(([key, value]) => task[key as keyof TaskQuickPatch] === value)) return true;

    setTasks((currentTasks) =>
      currentTasks.map((currentTask) => (currentTask.id === id ? { ...currentTask, ...changes } : currentTask)),
    );

    try {
      const userId = await getAuthenticatedUserId();
      await patch("tasks", changes, { id: id, user_id: userId });
      return true;
    } catch (error) {
      setTasks(previousTasks);
      toast.error("Não foi possível atualizar a tarefa", {
        description: getApiErrorMessage(error, "A alteração foi desfeita. Tente novamente."),
      });
      console.error("Erro ao atualizar tarefa pelo card:", error);
      return false;
    }
  }

  async function deleteTask(id: string) {
    setDeletingTaskId(id);

    try {
      const userId = await getAuthenticatedUserId();
      await remove("tasks", { id: id, user_id: userId });
      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
      toast.success("Tarefa excluída");
      return true;
    } catch (error) {
      toast.error("Não foi possível excluir a tarefa", {
        description: getApiErrorMessage(error, "Tente novamente em alguns instantes."),
      });
      console.error("Erro ao excluir tarefa:", error);
      return false;
    } finally {
      setDeletingTaskId(null);
    }
  }

  return {
    tasks,
    isLoading,
    isSaving,
    deletingTaskId,
    createTask,
    updateTask,
    updateTaskColumn,
    quickUpdateTask,
    deleteTask,
    refreshTasks: fetchTasks,
  };
}
