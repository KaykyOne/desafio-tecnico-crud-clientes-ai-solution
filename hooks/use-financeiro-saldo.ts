"use client";

//* Libraries Imports
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

//* Services Imports
import { rpc } from "@/services/api-service";
import { getAuthenticatedUserId } from "@/services/auth-service";

//* Types Imports
import type { FinanceiroTipo } from "@/hooks/use-financeiro";

//* Utils Imports
import { getApiErrorMessage } from "@/lib/api-error";

/** Uma linha por combinação (banco, tipo), já somada pelo Postgres. `banco_id` nulo = "sem banco". */
export type FinanceiroTotalLinha = {
  banco_id: string | null;
  tipo: FinanceiroTipo;
  total: number;
};

type TotalLinhaResponse = {
  banco_id: string | null;
  tipo: string;
  total: number | string;
};

/**
 * Totais acumulados do financeiro (até hoje), agrupados por banco e tipo.
 *
 * Não dá pra derivar de `useFinanceiro`: aquele hook busca só o período filtrado. E buscar tudo
 * no cliente não serve porque a API corta a resposta em 1000 linhas — o saldo ficaria
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
      const data = await rpc<TotalLinhaResponse[]>("financeiro_totais_por_banco");

      setLinhas(
        (data ?? []).map((linha) => ({
          banco_id: linha.banco_id,
          tipo: linha.tipo as FinanceiroTipo,
          // `numeric` do Postgres chega como string.
          total: Number(linha.total),
        })),
      );
    } catch (error) {
      toast.error("Não foi possível calcular o saldo", {
        description: getApiErrorMessage(error, "Tente atualizar a página novamente."),
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
