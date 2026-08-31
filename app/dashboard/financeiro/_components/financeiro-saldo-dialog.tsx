"use client";

//* Components Imports
import Button from "@/components/ui/button";
import Dialog from "@/components/ui/dialog";
import Table from "@/components/ui/table";

import { agruparPorBanco, resumirLinhas } from "./financeiro-saldo-card";

//* Types Imports
import type { BancoRecord } from "@/hooks/use-bancos";
import type { FinanceiroTotalLinha } from "@/hooks/use-financeiro-saldo";

//* Utils Imports
import { formatCurrency } from "@/lib/format-currency";

type FinanceiroSaldoDialogProps = {
  linhas: FinanceiroTotalLinha[];
  bancos: BancoRecord[];
  onOpenChange: (open: boolean) => void;
};

export function FinanceiroSaldoDialog({ linhas, bancos, onOpenChange }: FinanceiroSaldoDialogProps) {
  const { ganhos, saidas, saldo } = resumirLinhas(linhas);
  const porBanco = agruparPorBanco(linhas, bancos);

  return (
    <Dialog.DialogRoot open onOpenChange={onOpenChange}>
      <Dialog.DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto bg-background p-6 sm:max-w-lg sm:p-8">
        <Dialog.DialogHeader className="min-w-0">
          <Dialog.DialogTitle className="text-xl font-bold tracking-[-0.04em]">Saldo por banco</Dialog.DialogTitle>
          <Dialog.DialogDescription>
            Ganhos, saídas e saldo acumulados até hoje, em cada banco.
          </Dialog.DialogDescription>
        </Dialog.DialogHeader>

        <div className="min-w-0 rounded-xl border bg-muted p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] opacity-75">Saldo total</p>
          <p
            className={`mt-1 text-2xl font-black tracking-[-0.04em] ${saldo < 0 ? "text-rose-700" : "text-foreground"}`}
          >
            {formatCurrency(saldo)}
          </p>
          <p className="mt-1 flex flex-wrap gap-x-3 text-xs">
            <span className="font-semibold text-emerald-700">+{formatCurrency(ganhos)}</span>
            <span className="font-semibold text-rose-700">-{formatCurrency(saidas)}</span>
          </p>
        </div>

        {porBanco.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            Você ainda não cadastrou nenhum banco e não há lançamentos. Use o botão <strong>Bancos</strong> para
            começar.
          </p>
        ) : (
          <div className="min-w-0 overflow-x-auto">
            <Table.TableRoot>
              <Table.TableHeader>
                <Table.TableRow className="hover:bg-transparent">
                  <Table.TableHead className="px-3 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    Banco
                  </Table.TableHead>
                  <Table.TableHead className="px-3 text-right text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    Ganhos
                  </Table.TableHead>
                  <Table.TableHead className="px-3 text-right text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    Saídas
                  </Table.TableHead>
                  <Table.TableHead className="px-3 text-right text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    Saldo
                  </Table.TableHead>
                </Table.TableRow>
              </Table.TableHeader>
              <Table.TableBody>
                {porBanco.map((banco) => (
                  <Table.TableRow key={banco.bancoId ?? "sem-banco"}>
                    <Table.TableCell className="px-3 py-3 font-semibold">{banco.nome}</Table.TableCell>
                    <Table.TableCell className="px-3 py-3 text-right text-emerald-700">
                      {formatCurrency(banco.ganhos)}
                    </Table.TableCell>
                    <Table.TableCell className="px-3 py-3 text-right text-rose-700">
                      {formatCurrency(banco.saidas)}
                    </Table.TableCell>
                    <Table.TableCell
                      className={`px-3 py-3 text-right font-semibold ${banco.saldo < 0 ? "text-rose-700" : "text-foreground"}`}
                    >
                      {formatCurrency(banco.saldo)}
                    </Table.TableCell>
                  </Table.TableRow>
                ))}
              </Table.TableBody>
            </Table.TableRoot>
          </div>
        )}

        {bancos.length === 0 && porBanco.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Nenhum banco cadastrado ainda — todos os lançamentos estão em &quot;Sem banco&quot;. Cadastre seus bancos
            pelo botão <strong>Bancos</strong> para ver a quebra.
          </p>
        )}

        <Dialog.DialogFooter className="mt-2 min-w-0 border-t-0 bg-transparent p-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </Dialog.DialogFooter>
      </Dialog.DialogContent>
    </Dialog.DialogRoot>
  );
}
