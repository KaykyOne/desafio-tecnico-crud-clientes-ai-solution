"use client";

//* Libraries Imports
import { useState } from "react";
import { Plus, Repeat, Trash2, Upload } from "lucide-react";

//* Components Imports
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SelectContent, SelectItem, SelectRoot, SelectTrigger, SelectValue } from "@/components/ui/select";
import Table from "@/components/ui/table";

//* Hooks Imports
import { useClients } from "@/hooks/use-clients";
import { useFinanceiro, type FinanceiroRecord, type FinanceiroTipo } from "@/hooks/use-financeiro";
import { useGastosFixos } from "@/hooks/use-gastos-fixos";

import DeleteFinanceiroDialog from "./_components/delete-financeiro-dialog";
import FinanceiroFormDialog from "./_components/financeiro-form-dialog";
import FinanceiroSkeleton from "./_components/financeiro-skeleton";
import GastosFixosDialog from "./_components/gastos-fixos-dialog";
import ImportOfxDialog from "./_components/import-ofx-dialog";

const tipoLabels: Record<FinanceiroTipo, string> = { gasto: "Gasto", gasto_fixo: "Gasto fixo", ganho: "Ganho" };
const tipoStyles: Record<FinanceiroTipo, string> = {
  gasto: "border-rose-200 bg-rose-50 text-rose-800",
  gasto_fixo: "border-amber-200 bg-amber-50 text-amber-800",
  ganho: "border-sky-200 bg-sky-50 text-sky-800",
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(`${date}T00:00:00`));
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function FinanceiroPage() {
  const { records, tipoFilter, setTipoFilter, isLoading, isSaving, deletingId, createRecord, importRecords, deleteRecord } = useFinanceiro();
  const { clients } = useClients();
  const gastosFixosState = useGastosFixos();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isGastosFixosOpen, setIsGastosFixosOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState<FinanceiroRecord | null>(null);

  const total = records.reduce((sum, record) => sum + (record.tipo === "ganho" ? record.valor : -record.valor), 0);

  return (
    <section className="space-y-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">Financeiro</p>
          <h1 className="text-3xl font-bold tracking-[-0.05em] text-foreground">Extrato</h1>
          <p className="mt-2 text-sm text-muted-foreground">Acompanhe gastos, gastos fixos e ganhos num único lugar.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" className="h-11 px-4 font-bold" onClick={() => setIsGastosFixosOpen(true)}><Repeat />Gastos fixos</Button>
          <Button type="button" variant="outline" className="h-11 px-4 font-bold" onClick={() => setIsImportOpen(true)}><Upload />Importar OFX</Button>
          <Button type="button" className="h-11 px-4 font-bold" onClick={() => setIsFormOpen(true)}><Plus />Novo lançamento</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-muted p-5">
          <p className="text-xs font-semibold text-foreground opacity-75">Saldo do período filtrado</p>
          <p className={`mt-4 text-3xl font-black tracking-[-0.06em] ${total < 0 ? "text-rose-700" : "text-foreground"}`}>{formatCurrency(total)}</p>
        </div>
        <div className="flex flex-col justify-center gap-2 rounded-2xl border bg-background p-5">
          <p className="text-xs font-semibold text-muted-foreground">Filtrar por tipo</p>
          <SelectRoot value={tipoFilter} onValueChange={(value) => setTipoFilter(value as FinanceiroTipo | "all")}>
            <SelectTrigger className="h-10 w-full bg-background">
              <SelectValue>{tipoFilter === "all" ? "Todos" : tipoLabels[tipoFilter]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="gasto">Gasto</SelectItem>
              <SelectItem value="gasto_fixo">Gasto fixo</SelectItem>
              <SelectItem value="ganho">Ganho</SelectItem>
            </SelectContent>
          </SelectRoot>
        </div>
      </div>

      {isLoading ? (
        <FinanceiroSkeleton />
      ) : (
        <div className="space-y-4 rounded-xl border bg-card p-4 shadow-sm sm:p-5">
          <Table.TableRoot>
            <Table.TableHeader>
              <Table.TableRow className="hover:bg-transparent">
                <Table.TableHead className="px-3 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">Data</Table.TableHead>
                <Table.TableHead className="px-3 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">Tipo</Table.TableHead>
                <Table.TableHead className="px-3 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">Descrição</Table.TableHead>
                <Table.TableHead className="px-3 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">Cliente</Table.TableHead>
                <Table.TableHead className="px-3 text-right text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">Valor</Table.TableHead>
                <Table.TableHead className="px-3 text-right text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">Ações</Table.TableHead>
              </Table.TableRow>
            </Table.TableHeader>
            <Table.TableBody>
              {records.length === 0 ? (
                <Table.TableRow><Table.TableCell colSpan={6} className="h-40 text-center"><p className="font-semibold">Nenhum lançamento encontrado</p><p className="mt-1 text-sm text-muted-foreground">Cadastre um lançamento ou importe um extrato OFX.</p></Table.TableCell></Table.TableRow>
              ) : (
                records.map((record) => {
                  const client = clients.find((candidate) => candidate.id === record.cliente_id);
                  return (
                    <Table.TableRow key={record.id}>
                      <Table.TableCell className="px-3 py-4 text-muted-foreground">{formatDate(record.data)}</Table.TableCell>
                      <Table.TableCell className="px-3 py-4"><Badge variant="outline" className={tipoStyles[record.tipo]}>{tipoLabels[record.tipo]}</Badge></Table.TableCell>
                      <Table.TableCell className="px-3 py-4 font-semibold">{record.descricao || "—"}</Table.TableCell>
                      <Table.TableCell className="px-3 py-4 text-muted-foreground">{client?.name ?? "—"}</Table.TableCell>
                      <Table.TableCell className={`px-3 py-4 text-right font-semibold ${record.tipo === "ganho" ? "text-emerald-700" : "text-foreground"}`}>{record.tipo === "ganho" ? "+" : "-"}{formatCurrency(record.valor)}</Table.TableCell>
                      <Table.TableCell className="px-3 py-4 text-right"><Button type="button" variant="ghost" size="icon-sm" onClick={() => setDeletingRecord(record)} aria-label={`Excluir ${record.descricao ?? "lançamento"}`}><Trash2 /></Button></Table.TableCell>
                    </Table.TableRow>
                  );
                })
              )}
            </Table.TableBody>
          </Table.TableRoot>
        </div>
      )}

      <FinanceiroFormDialog open={isFormOpen} clients={clients} isSaving={isSaving} onOpenChange={setIsFormOpen} onSubmit={createRecord} />
      <ImportOfxDialog open={isImportOpen} clients={clients} isSaving={isSaving} onOpenChange={setIsImportOpen} onImport={importRecords} />
      <GastosFixosDialog
        open={isGastosFixosOpen}
        gastosFixos={gastosFixosState.gastosFixos}
        isSaving={gastosFixosState.isSaving}
        deletingId={gastosFixosState.deletingId}
        onOpenChange={setIsGastosFixosOpen}
        onCreate={gastosFixosState.createGastoFixo}
        onUpdate={gastosFixosState.updateGastoFixo}
        onToggleAtivo={gastosFixosState.toggleAtivo}
        onDelete={gastosFixosState.deleteGastoFixo}
      />
      <DeleteFinanceiroDialog
        open={Boolean(deletingRecord)}
        descricao={deletingRecord?.descricao ?? "esse lançamento"}
        isDeleting={Boolean(deletingId)}
        onOpenChange={(open) => { if (!open) setDeletingRecord(null); }}
        onConfirm={() => (deletingRecord ? deleteRecord(deletingRecord.id) : Promise.resolve(false))}
      />
    </section>
  );
}
