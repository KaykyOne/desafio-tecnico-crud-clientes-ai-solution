"use client";

//* Libraries Imports
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

//* Services Imports
import { supabase } from "./supabase";

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

function getSupabaseErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error) {
    const message = String(error.message);
    const code = "code" in error && error.code ? ` (${String(error.code)})` : "";
    return `${message}${code}`;
  }

  return fallback;
}

async function getAuthenticatedUserId() {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new Error("Sua sessão expirou. Entre novamente.");
  }

  return data.user.id;
}

export function useTasks() {
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);

    try {
      const userId = await getAuthenticatedUserId();
      const { data, error } = await supabase
        .from("tasks")
        .select(SELECT_COLUMNS)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks((data ?? []) as TaskRecord[]);
    } catch (error) {
      toast.error("Não foi possível carregar as tarefas", {
        description: getSupabaseErrorMessage(error, "Tente atualizar a página novamente."),
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
      const { error } = await supabase.from("tasks").insert({ ...input, user_id: userId });

      if (error) throw error;
      await fetchTasks();
      toast.success("Tarefa cadastrada");
      return true;
    } catch (error) {
      toast.error("Não foi possível cadastrar a tarefa", {
        description: getSupabaseErrorMessage(error, "Confira os dados e tente novamente."),
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
      const { error } = await supabase.from("tasks").update(input).eq("id", id).eq("user_id", userId);

      if (error) throw error;
      await fetchTasks();
      toast.success("Tarefa atualizada");
      return true;
    } catch (error) {
      toast.error("Não foi possível atualizar a tarefa", {
        description: getSupabaseErrorMessage(error, "Confira os dados e tente novamente."),
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
      const { error } = await supabase.from("tasks").update({ column_id: columnId }).eq("id", id).eq("user_id", userId);

      if (error) throw error;
      return true;
    } catch (error) {
      setTasks(previousTasks);
      toast.error("Não foi possível mover a tarefa", {
        description: getSupabaseErrorMessage(error, "A alteração foi desfeita. Tente novamente."),
      });
      console.error("Erro ao atualizar coluna da tarefa:", error);
      return false;
    }
  }

  /** Atualiza prioridade/cliente direto do card (Sheet de edição rápida), sem recarregar a lista inteira. */
  async function quickUpdateTask(id: string, patch: TaskQuickPatch) {
    const previousTasks = tasks;
    const task = previousTasks.find((currentTask) => currentTask.id === id);

    if (!task) return false;
    if (Object.entries(patch).every(([key, value]) => task[key as keyof TaskQuickPatch] === value)) return true;

    setTasks((currentTasks) =>
      currentTasks.map((currentTask) => (currentTask.id === id ? { ...currentTask, ...patch } : currentTask)),
    );

    try {
      const userId = await getAuthenticatedUserId();
      const { error } = await supabase.from("tasks").update(patch).eq("id", id).eq("user_id", userId);

      if (error) throw error;
      return true;
    } catch (error) {
      setTasks(previousTasks);
      toast.error("Não foi possível atualizar a tarefa", {
        description: getSupabaseErrorMessage(error, "A alteração foi desfeita. Tente novamente."),
      });
      console.error("Erro ao atualizar tarefa pelo card:", error);
      return false;
    }
  }

  async function deleteTask(id: string) {
    setDeletingTaskId(id);

    try {
      const userId = await getAuthenticatedUserId();
      const { error } = await supabase.from("tasks").delete().eq("id", id).eq("user_id", userId);

      if (error) throw error;
      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
      toast.success("Tarefa excluída");
      return true;
    } catch (error) {
      toast.error("Não foi possível excluir a tarefa", {
        description: getSupabaseErrorMessage(error, "Tente novamente em alguns instantes."),
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
