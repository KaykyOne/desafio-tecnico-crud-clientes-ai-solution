"use client";

//* Libraries Imports
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

//* Services Imports
import { supabase } from "./supabase";

export type BancoRecord = {
  id: string;
  user_id: string;
  nome: string;
  created_at: string;
};

const SELECT_COLUMNS = "id, user_id, nome, created_at";

function getSupabaseErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error) {
    const message = String(error.message);
    const code = "code" in error && error.code ? ` (${String(error.code)})` : "";
    return `${message}${code}`;
  }

  return fallback;
}

function isUniqueViolation(error: unknown) {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "23505");
}

async function getAuthenticatedUserId() {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new Error("Sua sessão expirou. Entre novamente.");
  }

  return data.user.id;
}

export function useBancos() {
  const [bancos, setBancos] = useState<BancoRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchBancos = useCallback(async () => {
    setIsLoading(true);

    try {
      const userId = await getAuthenticatedUserId();
      const { data, error } = await supabase
        .from("bancos")
        .select(SELECT_COLUMNS)
        .eq("user_id", userId)
        .order("nome", { ascending: true });

      if (error) throw error;
      setBancos((data ?? []) as BancoRecord[]);
    } catch (error) {
      toast.error("Não foi possível carregar os bancos", {
        description: getSupabaseErrorMessage(error, "Tente atualizar a página novamente."),
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
      const { error } = await supabase.from("bancos").insert({ nome: normalizedNome, user_id: userId });

      if (error) throw error;
      await fetchBancos();
      toast.success("Banco cadastrado");
      return true;
    } catch (error) {
      toast.error(
        isUniqueViolation(error) ? "Esse banco já está cadastrado" : "Não foi possível cadastrar o banco",
        { description: getSupabaseErrorMessage(error, "Tente novamente em alguns instantes.") }
      );
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
      const { error } = await supabase.from("bancos").delete().eq("id", id).eq("user_id", userId);

      if (error) throw error;
      setBancos((current) => current.filter((banco) => banco.id !== id));
      toast.success("Banco removido");
      return true;
    } catch (error) {
      toast.error("Não foi possível remover o banco", {
        description: getSupabaseErrorMessage(error, "Tente novamente em alguns instantes."),
      });
      console.error("Erro ao excluir banco:", error);
      return false;
    } finally {
      setDeletingId(null);
    }
  }

  return { bancos, isLoading, isSaving, deletingId, createBanco, deleteBanco };
}
