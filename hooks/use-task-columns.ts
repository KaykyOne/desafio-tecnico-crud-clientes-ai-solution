"use client";

//* Libraries Imports
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

//* Services Imports
import { get, patch, post, remove, upsert } from "@/services/api-service";
import { getAuthenticatedUserId } from "@/services/auth-service";

//* Utils Imports
import { getApiErrorMessage, isForeignKeyViolation } from "@/lib/api-error";

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

export function useTaskColumns() {
  const [columns, setColumns] = useState<TaskColumnRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchColumns = useCallback(async () => {
    setIsLoading(true);
    try {
      const userId = await getAuthenticatedUserId();
      const data = await get<TaskColumnRecord>("task_columns", {
        select: "id,user_id,key,name,color,position,created_at,updated_at",
        filters: { user_id: userId },
        order: [{ column: "position", ascending: true }],
      });
      setColumns(data);
    } catch (error) {
      toast.error("Não foi possível carregar as colunas", {
        description: getApiErrorMessage(error, "Tente atualizar a página novamente."),
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
      await post("task_columns", {
        user_id: userId,
        key: crypto.randomUUID(),
        name: normalizedName,
        position,
      });
      await fetchColumns();
      toast.success("Coluna criada");
      return true;
    } catch (error) {
      toast.error("Não foi possível criar a coluna", {
        description: getApiErrorMessage(error, "Tente novamente em alguns instantes."),
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
      await patch("task_columns", { name: normalizedName }, { id: id, user_id: userId });
      setColumns((current) =>
        current.map((column) => (column.id === id ? { ...column, name: normalizedName } : column)),
      );
      toast.success("Coluna renomeada");
      return true;
    } catch (error) {
      toast.error("Não foi possível renomear a coluna", {
        description: getApiErrorMessage(error, "Tente novamente em alguns instantes."),
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
      await remove("task_columns", { id: id, user_id: userId });
      setColumns((current) => current.filter((column) => column.id !== id));
      toast.success("Coluna excluída");
      return true;
    } catch (error) {
      const isForeignKeyError = isForeignKeyViolation(error);
      toast.error(
        isForeignKeyError ? "Não é possível excluir uma coluna com tarefas" : "Não foi possível excluir a coluna",
        {
          description: isForeignKeyError
            ? "Mova ou exclua as tarefas desta coluna antes de removê-la."
            : getApiErrorMessage(error, "Tente novamente em alguns instantes."),
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
      await upsert(
        "task_columns",
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
      return true;
    } catch (error) {
      setColumns(previousColumns);
      toast.error("Não foi possível reordenar as colunas", {
        description: getApiErrorMessage(error, "A ordem anterior foi restaurada."),
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
