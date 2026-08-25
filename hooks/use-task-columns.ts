"use client";

//* Libraries Imports
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

//* Services Imports
import { supabase } from "./supabase";

export type TaskColumnRecord = {
  id: string;
  user_id: string;
  key: string;
  name: string;
  color: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};

function getSupabaseErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error) return String(error.message);
  return fallback;
}

async function getAuthenticatedUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Sua sessão expirou. Entre novamente.");
  return data.user.id;
}

export function useTaskColumns() {
  const [columns, setColumns] = useState<TaskColumnRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchColumns = useCallback(async () => {
    setIsLoading(true);
    try {
      const userId = await getAuthenticatedUserId();
      const { data, error } = await supabase
        .from("task_columns")
        .select("id, user_id, key, name, color, position, created_at, updated_at")
        .eq("user_id", userId)
        .order("position", { ascending: true });
      if (error) throw error;
      setColumns((data ?? []) as TaskColumnRecord[]);
    } catch (error) {
      toast.error("Não foi possível carregar as colunas", {
        description: getSupabaseErrorMessage(error, "Tente atualizar a página novamente."),
      });
      console.error("Erro ao listar colunas de tarefas:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // The initial request owns its loading state inside fetchColumns.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchColumns();
  }, [fetchColumns]);

  async function createColumn(name: string) {
    const normalizedName = name.trim();
    if (!normalizedName) {
      toast.error("Informe um nome para a coluna");
      return false;
    }

    setIsSaving(true);
    try {
      const userId = await getAuthenticatedUserId();
      const position = columns.reduce((highest, column) => Math.max(highest, column.position), -1) + 1;
      const { error } = await supabase.from("task_columns").insert({
        user_id: userId,
        key: crypto.randomUUID(),
        name: normalizedName,
        position,
      });
      if (error) throw error;
      await fetchColumns();
      toast.success("Coluna criada");
      return true;
    } catch (error) {
      toast.error("Não foi possível criar a coluna", {
        description: getSupabaseErrorMessage(error, "Tente novamente em alguns instantes."),
      });
      console.error("Erro ao criar coluna de tarefas:", error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function renameColumn(id: string, name: string) {
    const normalizedName = name.trim();
    if (!normalizedName) {
      toast.error("Informe um nome para a coluna");
      return false;
    }

    setIsSaving(true);
    try {
      const userId = await getAuthenticatedUserId();
      const { error } = await supabase
        .from("task_columns")
        .update({ name: normalizedName })
        .eq("id", id)
        .eq("user_id", userId);
      if (error) throw error;
      setColumns((current) =>
        current.map((column) => (column.id === id ? { ...column, name: normalizedName } : column)),
      );
      toast.success("Coluna renomeada");
      return true;
    } catch (error) {
      toast.error("Não foi possível renomear a coluna", {
        description: getSupabaseErrorMessage(error, "Tente novamente em alguns instantes."),
      });
      console.error("Erro ao renomear coluna de tarefas:", error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteColumn(id: string) {
    setIsSaving(true);
    try {
      const userId = await getAuthenticatedUserId();
      const { error } = await supabase.from("task_columns").delete().eq("id", id).eq("user_id", userId);
      if (error) throw error;
      setColumns((current) => current.filter((column) => column.id !== id));
      toast.success("Coluna excluída");
      return true;
    } catch (error) {
      const isForeignKeyError = error && typeof error === "object" && "code" in error && error.code === "23503";
      toast.error(
        isForeignKeyError ? "Não é possível excluir uma coluna com tarefas" : "Não foi possível excluir a coluna",
        {
          description: isForeignKeyError
            ? "Mova ou exclua as tarefas desta coluna antes de removê-la."
            : getSupabaseErrorMessage(error, "Tente novamente em alguns instantes."),
        },
      );
      console.error("Erro ao excluir coluna de tarefas:", error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function reorderColumns(orderedIds: string[]) {
    const previousColumns = columns;
    const reorderedColumns = orderedIds.map((id, position) => ({
      ...columns.find((column) => column.id === id)!,
      position,
    }));
    if (reorderedColumns.some((column) => !column.id)) return false;

    setColumns(reorderedColumns);
    try {
      const userId = await getAuthenticatedUserId();
      const { error } = await supabase.from("task_columns").upsert(
        reorderedColumns.map(({ id, key, name, color, position }) => ({
          id,
          user_id: userId,
          key,
          name,
          color,
          position,
        })),
        { onConflict: "id" },
      );
      if (error) throw error;
      return true;
    } catch (error) {
      setColumns(previousColumns);
      toast.error("Não foi possível reordenar as colunas", {
        description: getSupabaseErrorMessage(error, "A ordem anterior foi restaurada."),
      });
      console.error("Erro ao reordenar colunas de tarefas:", error);
      return false;
    }
  }

  return {
    columns,
    isLoading,
    isSaving,
    createColumn,
    renameColumn,
    deleteColumn,
    reorderColumns,
    refreshColumns: fetchColumns,
  };
}
