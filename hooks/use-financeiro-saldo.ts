"use client";

//* Libraries Imports
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

//* Services Imports
import { supabase } from "./supabase";

//* Types Imports
import type { FinanceiroTipo } from "./use-financeiro";

/** Uma linha por combinação (banco, tipo), já somada pelo Postgres. `banco_id` nulo = "sem banco". */
export type FinanceiroTotalLinha = {
  banco_id: string | null;
  tipo: FinanceiroTipo;
  total: number;
};

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

/**
 * Totais acumulados do financeiro (até hoje), agrupados por banco e tipo.
 *
 * Não dá pra derivar de `useFinanceiro`: aquele hook busca só o período filtrado. E buscar tudo
 * no cliente não serve porque o PostgREST corta a resposta em 1000 linhas — o saldo ficaria
 * silenciosamente errado conforme o histórico cresce. A RPC soma no banco e devolve um punhado
 * de linhas, independente do tamanho do histórico.
 */
export function useFinanceiroSaldo() {
  const [linhas, setLinhas] = useState<FinanceiroTotalLinha[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sem deps: é all-time, não deve re-disparar quando o período da tela muda.
  const fetchTotais = useCallback(async () => {
    setIsLoading(true);

    try {
      await getAuthenticatedUserId();
      const { data, error } = await supabase.rpc("financeiro_totais_por_banco");

      if (error) throw error;
      setLinhas(
        (data ?? []).map((linha: { banco_id: string | null; tipo: string; total: number | string }) => ({
          banco_id: linha.banco_id,
          tipo: linha.tipo as FinanceiroTipo,
          // `numeric` do Postgres chega como string no supabase-js.
          total: Number(linha.total),
        })),
      );
    } catch (error) {
      toast.error("Não foi possível calcular o saldo", {
        description: getSupabaseErrorMessage(error, "Tente atualizar a página novamente."),
      });
      console.error("Erro ao calcular totais do financeiro:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // The initial request owns its loading state inside fetchTotais.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchTotais();
  }, [fetchTotais]);

  return { linhas, isLoading, refreshSaldo: fetchTotais };
}
