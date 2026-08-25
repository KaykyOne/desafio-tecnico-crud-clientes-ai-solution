"use client";

//* Libraries Imports
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

//* Services Imports
import { supabase } from "./supabase";

export type FinanceiroTipo = "gasto" | "gasto_fixo" | "ganho";

export type FinanceiroRecord = {
  id: string;
  user_id: string;
  data: string;
  tipo: FinanceiroTipo;
  valor: number;
  descricao: string | null;
  cliente_id: string | null;
  gasto_fixo_id: string | null;
  fitid: string | null;
  created_at: string;
};

export type FinanceiroInput = {
  data: string;
  tipo: "gasto" | "ganho";
  valor: number;
  descricao: string;
  cliente_id: string | null;
  fitid?: string | null;
};

const SELECT_COLUMNS = "id, user_id, data, tipo, valor, descricao, cliente_id, gasto_fixo_id, fitid, created_at";

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

export function useFinanceiro() {
  const [records, setRecords] = useState<FinanceiroRecord[]>([]);
  const [tipoFilter, setTipoFilter] = useState<FinanceiroTipo | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    setIsLoading(true);

    try {
      const userId = await getAuthenticatedUserId();
      let query = supabase
        .from("financeiro")
        .select(SELECT_COLUMNS)
        .eq("user_id", userId)
        .order("data", { ascending: false })
        .order("created_at", { ascending: false });

      if (tipoFilter !== "all") query = query.eq("tipo", tipoFilter);

      const { data, error } = await query;

      if (error) throw error;
      setRecords((data ?? []) as FinanceiroRecord[]);
    } catch (error) {
      toast.error("Não foi possível carregar o financeiro", {
        description: getSupabaseErrorMessage(error, "Tente atualizar a página novamente."),
      });
      console.error("Erro ao listar lançamentos financeiros:", error);
    } finally {
      setIsLoading(false);
    }
  }, [tipoFilter]);

  useEffect(() => {
    // The initial (and every filter-change) request owns its loading state inside fetchRecords.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchRecords();
  }, [fetchRecords]);

  async function createRecord(input: FinanceiroInput) {
    setIsSaving(true);

    try {
      const userId = await getAuthenticatedUserId();
      const { error } = await supabase.from("financeiro").insert({
        ...input,
        descricao: input.descricao.trim() || null,
        user_id: userId,
      });

      if (error) throw error;
      await fetchRecords();
      toast.success("Lançamento cadastrado");
      return true;
    } catch (error) {
      toast.error(
        isUniqueViolation(error) ? "Esse lançamento já foi importado" : "Não foi possível cadastrar o lançamento",
        {
          description: isUniqueViolation(error)
            ? "Essa transação do extrato já está no financeiro."
            : getSupabaseErrorMessage(error, "Confira os dados e tente novamente."),
        }
      );
      console.error("Erro ao cadastrar lançamento financeiro:", error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  /** Insere vários lançamentos de uma vez (importação de OFX), pulando os que já foram importados (mesmo `fitid`). */
  async function importRecords(inputs: FinanceiroInput[]) {
    if (inputs.length === 0) return { inserted: 0, skipped: 0 };

    setIsSaving(true);

    try {
      const userId = await getAuthenticatedUserId();
      const rows = inputs.map((input) => ({ ...input, descricao: input.descricao.trim() || null, user_id: userId }));
      const { data, error } = await supabase
        .from("financeiro")
        .upsert(rows, { onConflict: "user_id,fitid", ignoreDuplicates: true })
        .select("id");

      if (error) throw error;
      await fetchRecords();

      const inserted = data?.length ?? 0;
      const skipped = rows.length - inserted;
      toast.success(`${inserted} lançamento${inserted === 1 ? "" : "s"} importado${inserted === 1 ? "" : "s"}`, {
        description: skipped > 0 ? `${skipped} já estava${skipped === 1 ? "" : "m"} no financeiro e ${skipped === 1 ? "foi ignorado" : "foram ignorados"}.` : undefined,
      });
      return { inserted, skipped };
    } catch (error) {
      toast.error("Não foi possível importar os lançamentos", {
        description: getSupabaseErrorMessage(error, "Tente novamente em alguns instantes."),
      });
      console.error("Erro ao importar lançamentos do OFX:", error);
      return { inserted: 0, skipped: 0 };
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteRecord(id: string) {
    setDeletingId(id);

    try {
      const userId = await getAuthenticatedUserId();
      const { error } = await supabase.from("financeiro").delete().eq("id", id).eq("user_id", userId);

      if (error) throw error;
      setRecords((current) => current.filter((record) => record.id !== id));
      toast.success("Lançamento excluído");
      return true;
    } catch (error) {
      toast.error("Não foi possível excluir o lançamento", {
        description: getSupabaseErrorMessage(error, "Tente novamente em alguns instantes."),
      });
      console.error("Erro ao excluir lançamento financeiro:", error);
      return false;
    } finally {
      setDeletingId(null);
    }
  }

  return {
    records,
    tipoFilter,
    setTipoFilter,
    isLoading,
    isSaving,
    deletingId,
    createRecord,
    importRecords,
    deleteRecord,
    refreshRecords: fetchRecords,
  };
}
