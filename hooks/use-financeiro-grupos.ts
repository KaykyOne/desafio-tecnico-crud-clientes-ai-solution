"use client";

//* Libraries Imports
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

//* Services Imports
import { get, patch, post, remove } from "@/services/api-service";
import { getAuthenticatedUserId } from "@/services/auth-service";

//* Utils Imports
import { getApiErrorMessage } from "@/lib/api-error";

export type FinanceiroGrupoRecord = {
  id: string;
  user_id: string;
  nome: string | null;
  termos: string[];
  created_at: string;
};

const TABLE = "financeiro_grupos";
const SELECT_COLUMNS = "id,user_id,nome,termos,created_at";

/** Nome é obrigatório só quando há mais de uma palavra — com uma só, a palavra já é o nome. */
function normalizeGrupoInput(termos: string[], nome: string) {
  const normalizedTermos = [...new Set(termos.map((termo) => termo.trim()).filter(Boolean))];
  if (normalizedTermos.length === 0) return { error: "Informe ao menos uma palavra para agrupar" } as const;
  if (normalizedTermos.length > 1 && !nome.trim()) {
    return { error: "Dê um nome ao card quando usar mais de uma palavra" } as const;
  }

  return { termos: normalizedTermos, nome: normalizedTermos.length > 1 ? nome.trim() : null } as const;
}

export function useFinanceiroGrupos() {
  const [grupos, setGrupos] = useState<FinanceiroGrupoRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchGrupos = useCallback(async () => {
    setIsLoading(true);

    try {
      const userId = await getAuthenticatedUserId();
      const data = await get<FinanceiroGrupoRecord>(TABLE, {
        select: SELECT_COLUMNS,
        filters: { user_id: userId },
        order: [{ column: "created_at", ascending: true }],
      });

      setGrupos(data);
    } catch (error) {
      toast.error("Não foi possível carregar os cards de agrupamento", {
        description: getApiErrorMessage(error, "Tente atualizar a página novamente."),
      });
      console.error("Erro ao listar grupos financeiros:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // The initial request owns its loading state inside fetchGrupos.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchGrupos();
  }, [fetchGrupos]);

  async function createGrupo(termos: string[], nome: string) {
    const normalized = normalizeGrupoInput(termos, nome);
    if ("error" in normalized) {
      toast.error(normalized.error);
      return false;
    }

    setIsSaving(true);

    try {
      const userId = await getAuthenticatedUserId();
      await post(TABLE, { termos: normalized.termos, nome: normalized.nome, user_id: userId });

      await fetchGrupos();
      toast.success("Card de agrupamento criado");
      return true;
    } catch (error) {
      toast.error("Não foi possível criar o card", {
        description: getApiErrorMessage(error, "Tente novamente em alguns instantes."),
      });
      console.error("Erro ao criar grupo financeiro:", error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function updateGrupo(id: string, termos: string[], nome: string) {
    const normalized = normalizeGrupoInput(termos, nome);
    if ("error" in normalized) {
      toast.error(normalized.error);
      return false;
    }

    setIsSaving(true);

    try {
      const userId = await getAuthenticatedUserId();
      await patch(TABLE, { termos: normalized.termos, nome: normalized.nome }, { id, user_id: userId });

      setGrupos((current) =>
        current.map((grupo) =>
          grupo.id === id ? { ...grupo, termos: normalized.termos, nome: normalized.nome } : grupo,
        ),
      );
      toast.success("Card atualizado");
      return true;
    } catch (error) {
      toast.error("Não foi possível atualizar o card", {
        description: getApiErrorMessage(error, "Tente novamente em alguns instantes."),
      });
      console.error("Erro ao atualizar grupo financeiro:", error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteGrupo(id: string) {
    setDeletingId(id);

    try {
      const userId = await getAuthenticatedUserId();
      await remove(TABLE, { id, user_id: userId });

      setGrupos((current) => current.filter((grupo) => grupo.id !== id));
      toast.success("Card removido");
      return true;
    } catch (error) {
      toast.error("Não foi possível remover o card", {
        description: getApiErrorMessage(error, "Tente novamente em alguns instantes."),
      });
      console.error("Erro ao excluir grupo financeiro:", error);
      return false;
    } finally {
      setDeletingId(null);
    }
  }

  return { grupos, isLoading, isSaving, deletingId, createGrupo, updateGrupo, deleteGrupo };
}
