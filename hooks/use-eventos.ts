"use client";

//* Libraries Imports
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

//* Services Imports
import { get, patch, post, remove } from "@/services/api-service";
import { getAuthenticatedUserId } from "@/services/auth-service";

//* Utils Imports
import { getApiErrorMessage } from "@/lib/api-error";

export type EventoRecord = {
  id: string;
  user_id: string;
  titulo: string;
  descricao: string | null;
  local: string | null;
  data_inicio: string;
  data_fim: string;
  dia_inteiro: boolean;
  cliente_id: string | null;
  created_at: string;
  updated_at: string;
};

export type EventoInput = {
  titulo: string;
  descricao: string;
  local: string;
  data_inicio: string;
  data_fim: string;
  dia_inteiro: boolean;
  cliente_id: string | null;
};

const SELECT_COLUMNS =
  "id, user_id, titulo, descricao, local, data_inicio, data_fim, dia_inteiro, cliente_id, created_at, updated_at";

export function useEventos() {
  const [eventos, setEventos] = useState<EventoRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchEventos = useCallback(async () => {
    setIsLoading(true);

    try {
      const userId = await getAuthenticatedUserId();
      const data = await get<EventoRecord>("eventos", {
        select: SELECT_COLUMNS,
        filters: { user_id: userId },
        order: [{ column: "data_inicio", ascending: true }],
      });
      setEventos(data);
    } catch (error) {
      toast.error("Não foi possível carregar a agenda", {
        description: getApiErrorMessage(error, "Tente atualizar a página novamente."),
      });
      console.error("Erro ao listar eventos:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // The initial request owns its loading state inside fetchEventos.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchEventos();
  }, [fetchEventos]);

  async function createEvento(input: EventoInput) {
    setIsSaving(true);

    try {
      const userId = await getAuthenticatedUserId();
      await post("eventos", {
        ...input,
        descricao: input.descricao.trim() || null,
        local: input.local.trim() || null,
        user_id: userId,
      });
      await fetchEventos();
      toast.success("Evento cadastrado");
      return true;
    } catch (error) {
      toast.error("Não foi possível cadastrar o evento", {
        description: getApiErrorMessage(error, "Confira os dados e tente novamente."),
      });
      console.error("Erro ao cadastrar evento:", error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function updateEvento(id: string, input: EventoInput) {
    setIsSaving(true);

    try {
      const userId = await getAuthenticatedUserId();
      await patch(
        "eventos",
        { ...input, descricao: input.descricao.trim() || null, local: input.local.trim() || null },
        { id: id, user_id: userId },
      );
      await fetchEventos();
      toast.success("Evento atualizado");
      return true;
    } catch (error) {
      toast.error("Não foi possível atualizar o evento", {
        description: getApiErrorMessage(error, "Confira os dados e tente novamente."),
      });
      console.error("Erro ao atualizar evento:", error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteEvento(id: string) {
    setDeletingId(id);

    try {
      const userId = await getAuthenticatedUserId();
      await remove("eventos", { id: id, user_id: userId });
      setEventos((current) => current.filter((evento) => evento.id !== id));
      toast.success("Evento excluído");
      return true;
    } catch (error) {
      toast.error("Não foi possível excluir o evento", {
        description: getApiErrorMessage(error, "Tente novamente em alguns instantes."),
      });
      console.error("Erro ao excluir evento:", error);
      return false;
    } finally {
      setDeletingId(null);
    }
  }

  return {
    eventos,
    isLoading,
    isSaving,
    deletingId,
    createEvento,
    updateEvento,
    deleteEvento,
    refreshEventos: fetchEventos,
  };
}
