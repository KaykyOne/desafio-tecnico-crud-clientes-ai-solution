"use client";

//* Libraries Imports
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

//* Services Imports
import { get, post, remove } from "@/services/api-service";
import { getAuthenticatedUserId } from "@/services/auth-service";

//* Utils Imports
import { getApiErrorMessage, isUniqueViolation } from "@/lib/api-error";

export type BancoRecord = {
  id: string;
  user_id: string;
  nome: string;
  created_at: string;
};

const TABLE = "bancos";
const SELECT_COLUMNS = "id,user_id,nome,created_at";

export function useBancos() {
  const [bancos, setBancos] = useState<BancoRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchBancos = useCallback(async () => {
    setIsLoading(true);

    try {
      const userId = await getAuthenticatedUserId();
      const data = await get<BancoRecord>(TABLE, {
        select: SELECT_COLUMNS,
        filters: { user_id: userId },
        order: [{ column: "nome", ascending: true }],
      });

      setBancos(data);
    } catch (error) {
      toast.error("Não foi possível carregar os bancos", {
        description: getApiErrorMessage(error, "Tente atualizar a página novamente."),
      });
      console.error("Erro ao listar bancos:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // The initial request owns its loading state inside fetchBancos.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchBancos();
  }, [fetchBancos]);

  async function createBanco(nome: string) {
    const normalizedNome = nome.trim();
    if (!normalizedNome) {
      toast.error("Informe o nome do banco");
      return false;
    }

    setIsSaving(true);

    try {
      const userId = await getAuthenticatedUserId();
      await post(TABLE, { nome: normalizedNome, user_id: userId });

      await fetchBancos();
      toast.success("Banco cadastrado");
      return true;
    } catch (error) {
      toast.error(isUniqueViolation(error) ? "Esse banco já está cadastrado" : "Não foi possível cadastrar o banco", {
        description: getApiErrorMessage(error, "Tente novamente em alguns instantes."),
      });
      console.error("Erro ao criar banco:", error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteBanco(id: string) {
    setDeletingId(id);

    try {
      const userId = await getAuthenticatedUserId();
      await remove(TABLE, { id, user_id: userId });

      setBancos((current) => current.filter((banco) => banco.id !== id));
      toast.success("Banco removido");
      return true;
    } catch (error) {
      toast.error("Não foi possível remover o banco", {
        description: getApiErrorMessage(error, "Tente novamente em alguns instantes."),
      });
      console.error("Erro ao excluir banco:", error);
      return false;
    } finally {
      setDeletingId(null);
    }
  }

  return { bancos, isLoading, isSaving, deletingId, createBanco, deleteBanco };
}
