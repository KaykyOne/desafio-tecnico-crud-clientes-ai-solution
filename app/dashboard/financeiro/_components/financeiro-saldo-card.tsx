"use client";

//* Components Imports
import { Skeleton } from "@/components/ui/skeleton";

//* Types Imports
import type { BancoRecord } from "@/hooks/use-bancos";
import type { FinanceiroTotalLinha } from "@/hooks/use-financeiro-saldo";

//* Utils Imports
import { formatCurrency } from "@/lib/format-currency";

export type SaldoResumo = { ganhos: number; saidas: number; saldo: number };
export type SaldoPorBanco = { bancoId: string | null; nome: string } & SaldoResumo;

type FinanceiroSaldoCardProps = {
  linhas: FinanceiroTotalLinha[];
  isLoading: boolean;
  onOpen: () => void;
};

/**
 * Soma as linhas em ganhos / saídas / saldo.
 *
 * `valor` no banco é sempre positivo — o sinal vem só do `tipo`. "Saídas" junta `gasto` e
 * `gasto_fixo`, mesma regra usada no saldo do período e nos cards de palavra-chave.
 */
export function resumirLinhas(linhas: FinanceiroTotalLinha[]): SaldoResumo {
  const ganhos = linhas.reduce((sum, linha) => (linha.tipo === "ganho" ? sum + linha.total : sum), 0);
  const saidas = linhas.reduce((sum, linha) => (linha.tipo === "ganho" ? sum : sum + linha.total), 0);
  return { ganhos, saidas, saldo: ganhos - saidas };
}

/**
 * Quebra os totais por banco. Bancos cadastrados aparecem mesmo sem lançamento (pra dar a foto
 * completa); o balde "sem banco" só aparece se tiver algum lançamento solto.
 */
export function agruparPorBanco(linhas: FinanceiroTotalLinha[], bancos: BancoRecord[]): SaldoPorBanco[] {
  const porBanco = bancos
    .map((banco) => ({
      bancoId: banco.id,
      nome: banco.nome,
      ...resumirLinhas(linhas.filter((linha) => linha.banco_id === banco.id)),
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

  const semBancoLinhas = linhas.filter((linha) => linha.banco_id === null);
  if (semBancoLinhas.length === 0) return porBanco;

  return [...porBanco, { bancoId: null, nome: "Sem banco", ...resumirLinhas(semBancoLinhas) }];
}

export default function FinanceiroSaldoCard({ linhas, isLoading, onOpen }: FinanceiroSaldoCardProps) {
  const { ganhos, saidas, saldo } = resumirLinhas(linhas);

  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={isLoading}
      className="rounded-2xl border bg-muted p-5 text-left transition-colors hover:bg-accent/40 disabled:cursor-default disabled:hover:bg-muted"
    >
      <p className="text-xs font-semibold text-foreground opacity-75">Saldo até o momento</p>

      {isLoading ? (
        <Skeleton className="mt-4 h-9 w-36" />
      ) : (
        <p className={`mt-4 text-3xl font-black tracking-[-0.06em] ${saldo < 0 ? "text-rose-700" : "text-foreground"}`}>
          {formatCurrency(saldo)}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {isLoading ? (
          <Skeleton className="h-4 w-40" />
        ) : (
          <>
            <span className="font-semibold text-emerald-700">+{formatCurrency(ganhos)}</span>
            <span className="font-semibold text-rose-700">-{formatCurrency(saidas)}</span>
          </>
        )}
      </div>

      <p className="mt-2 text-xs text-muted-foreground">Todos os bancos · ver detalhes</p>
    </button>
  );
}
