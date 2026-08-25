"use client";

//* Libraries Imports
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

//* Services Imports
import { supabase } from "./supabase";

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

const SELECT_COLUMNS = "id, user_id, descricao, valor, dia_cobranca, data_inicio, data_fim, ativo, created_at, updated_at";

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

export function useGastosFixos() {
  const [gastosFixos, setGastosFixos] = useState<GastoFixoRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchGastosFixos = useCallback(async () => {
    setIsLoading(true);

    try {
      const userId = await getAuthenticatedUserId();
      const { data, error } = await supabase
        .from("gastos_fixos")
        .select(SELECT_COLUMNS)
        .eq("user_id", userId)
        .order("ativo", { ascending: false })
        .order("dia_cobranca", { ascending: true });

      if (error) throw error;
      setGastosFixos((data ?? []) as GastoFixoRecord[]);
    } catch (error) {
      toast.error("Não foi possível carregar os gastos fixos", {
        description: getSupabaseErrorMessage(error, "Tente atualizar a página novamente."),
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
      const { error } = await supabase.from("gastos_fixos").insert({
        ...input,
        descricao: input.descricao.trim() || null,
        user_id: userId,
      });

      if (error) throw error;
      await fetchGastosFixos();
      toast.success("Gasto fixo cadastrado");
      return true;
    } catch (error) {
      toast.error("Não foi possível cadastrar o gasto fixo", {
        description: getSupabaseErrorMessage(error, "Confira os dados e tente novamente."),
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
      const { error } = await supabase
        .from("gastos_fixos")
        .update({ ...input, descricao: input.descricao.trim() || null })
        .eq("id", id)
        .eq("user_id", userId);

      if (error) throw error;
      await fetchGastosFixos();
      toast.success("Gasto fixo atualizado");
      return true;
    } catch (error) {
      toast.error("Não foi possível atualizar o gasto fixo", {
        description: getSupabaseErrorMessage(error, "Confira os dados e tente novamente."),
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
      const { error } = await supabase.from("gastos_fixos").update({ ativo }).eq("id", id).eq("user_id", userId);

      if (error) throw error;
      toast.success(ativo ? "Gasto fixo ativado" : "Gasto fixo desativado");
      return true;
    } catch (error) {
      setGastosFixos(previousGastosFixos);
      toast.error("Não foi possível alterar o gasto fixo", {
        description: getSupabaseErrorMessage(error, "A alteração foi desfeita. Tente novamente."),
      });
      console.error("Erro ao ativar/desativar gasto fixo:", error);
      return false;
    }
  }

  async function deleteGastoFixo(id: string) {
    setDeletingId(id);

    try {
      const userId = await getAuthenticatedUserId();
      const { error } = await supabase.from("gastos_fixos").delete().eq("id", id).eq("user_id", userId);

      if (error) throw error;
      setGastosFixos((current) => current.filter((gasto) => gasto.id !== id));
      toast.success("Gasto fixo excluído");
      return true;
    } catch (error) {
      toast.error("Não foi possível excluir o gasto fixo", {
        description: getSupabaseErrorMessage(error, "Tente novamente em alguns instantes."),
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
