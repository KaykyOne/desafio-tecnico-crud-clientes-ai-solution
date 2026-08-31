"use client";

//* Libraries Imports
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

//* Services Imports
import { get, patch, post, remove } from "@/services/api-service";
import { getAuthenticatedUserId } from "@/services/auth-service";

//* Utils Imports
import { getApiErrorMessage } from "@/lib/api-error";

export type GastoFixoRecord = {
  id: string;
  user_id: string;
  descricao: string | null;
  valor: number;
  dia_cobranca: number;
  data_inicio: string;
  data_fim: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
};

export type GastoFixoInput = {
  descricao: string;
  valor: number;
  dia_cobranca: number;
  data_inicio: string;
  data_fim: string | null;
};

const SELECT_COLUMNS =
  "id, user_id, descricao, valor, dia_cobranca, data_inicio, data_fim, ativo, created_at, updated_at";

export function useGastosFixos() {
  const [gastosFixos, setGastosFixos] = useState<GastoFixoRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchGastosFixos = useCallback(async () => {
    setIsLoading(true);

    try {
      const userId = await getAuthenticatedUserId();
      const data = await get<GastoFixoRecord>("gastos_fixos", {
        select: SELECT_COLUMNS,
        filters: { user_id: userId },
        order: [
          { column: "ativo", ascending: false },
          { column: "dia_cobranca", ascending: true },
        ],
      });
      setGastosFixos(data);
    } catch (error) {
      toast.error("Não foi possível carregar os gastos fixos", {
        description: getApiErrorMessage(error, "Tente atualizar a página novamente."),
      });
      console.error("Erro ao listar gastos fixos:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // The initial request owns its loading state inside fetchGastosFixos.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchGastosFixos();
  }, [fetchGastosFixos]);

  async function createGastoFixo(input: GastoFixoInput) {
    setIsSaving(true);

    try {
      const userId = await getAuthenticatedUserId();
      await post("gastos_fixos", {
        ...input,
        descricao: input.descricao.trim() || null,
        user_id: userId,
      });
      await fetchGastosFixos();
      toast.success("Gasto fixo cadastrado");
      return true;
    } catch (error) {
      toast.error("Não foi possível cadastrar o gasto fixo", {
        description: getApiErrorMessage(error, "Confira os dados e tente novamente."),
      });
      console.error("Erro ao cadastrar gasto fixo:", error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function updateGastoFixo(id: string, input: GastoFixoInput) {
    setIsSaving(true);

    try {
      const userId = await getAuthenticatedUserId();
      await patch("gastos_fixos", { ...input, descricao: input.descricao.trim() || null }, { id: id, user_id: userId });
      await fetchGastosFixos();
      toast.success("Gasto fixo atualizado");
      return true;
    } catch (error) {
      toast.error("Não foi possível atualizar o gasto fixo", {
        description: getApiErrorMessage(error, "Confira os dados e tente novamente."),
      });
      console.error("Erro ao atualizar gasto fixo:", error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleAtivo(id: string, ativo: boolean) {
    const previousGastosFixos = gastosFixos;
    setGastosFixos((current) => current.map((gasto) => (gasto.id === id ? { ...gasto, ativo } : gasto)));

    try {
      const userId = await getAuthenticatedUserId();
      await patch("gastos_fixos", { ativo }, { id: id, user_id: userId });
      toast.success(ativo ? "Gasto fixo ativado" : "Gasto fixo desativado");
      return true;
    } catch (error) {
      setGastosFixos(previousGastosFixos);
      toast.error("Não foi possível alterar o gasto fixo", {
        description: getApiErrorMessage(error, "A alteração foi desfeita. Tente novamente."),
      });
      console.error("Erro ao ativar/desativar gasto fixo:", error);
      return false;
    }
  }

  async function deleteGastoFixo(id: string) {
    setDeletingId(id);

    try {
      const userId = await getAuthenticatedUserId();
      await remove("gastos_fixos", { id: id, user_id: userId });
      setGastosFixos((current) => current.filter((gasto) => gasto.id !== id));
      toast.success("Gasto fixo excluído");
      return true;
    } catch (error) {
      toast.error("Não foi possível excluir o gasto fixo", {
        description: getApiErrorMessage(error, "Tente novamente em alguns instantes."),
      });
      console.error("Erro ao excluir gasto fixo:", error);
      return false;
    } finally {
      setDeletingId(null);
    }
  }

  return {
    gastosFixos,
    isLoading,
    isSaving,
    deletingId,
    createGastoFixo,
    updateGastoFixo,
    toggleAtivo,
    deleteGastoFixo,
    refreshGastosFixos: fetchGastosFixos,
  };
}
