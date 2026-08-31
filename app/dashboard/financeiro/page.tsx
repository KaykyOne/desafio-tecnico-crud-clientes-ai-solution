"use client";

//* Components Imports
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Table from "@/components/ui/table";

import { BancosDialog } from "./_components/bancos-dialog";
import { DeleteFinanceiroDialog } from "./_components/delete-financeiro-dialog";
import { FinanceiroFormDialog } from "./_components/financeiro-form-dialog";
import { FinanceiroGrupos } from "./_components/financeiro-grupos";
import { FinanceiroSaldoCard } from "./_components/financeiro-saldo-card";
import { FinanceiroSaldoDialog } from "./_components/financeiro-saldo-dialog";
import { FinanceiroSkeleton } from "./_components/financeiro-skeleton";
import { GastosFixosDialog } from "./_components/gastos-fixos-dialog";
import { ImportOfxDialog } from "./_components/import-ofx-dialog";
import { PeriodFilterControl } from "./_components/period-filter";

//* Libraries Imports
import { useEffect, useMemo, useState } from "react";
import { Building2, Download, Plus, Repeat, Search, Trash2, Upload } from "lucide-react";

//* Hooks Imports
import { useBancos } from "@/hooks/use-bancos";
import { useClients } from "@/hooks/use-clients";
import { useFinanceiro, type FinanceiroRecord, type FinanceiroTipo } from "@/hooks/use-financeiro";
import { useFinanceiroGrupos } from "@/hooks/use-financeiro-grupos";
import { useFinanceiroSaldo } from "@/hooks/use-financeiro-saldo";
import { useGastosFixos } from "@/hooks/use-gastos-fixos";

//* Utils Imports
import { exportFinanceiroToCsv } from "@/lib/financeiro-csv";
import { formatCurrency } from "@/lib/format-currency";
import { formatDate } from "@/lib/format-date";
import { normalizeText } from "@/lib/normalize-text";

const tipoLabels: Record<FinanceiroTipo, string> = { gasto: "Gasto", gasto_fixo: "Gasto fixo", ganho: "Ganho" };
const tipoStyles: Record<FinanceiroTipo, string> = {
  gasto: "border-rose-200 bg-rose-50 text-rose-800",
  gasto_fixo: "border-amber-200 bg-amber-50 text-amber-800",
  ganho: "border-sky-200 bg-sky-50 text-sky-800",
};

/** Extrai um número de algo como "50", "50 reais" ou "R$ 50,00". */
function parseValorBusca(value: string) {
  const cleaned = value.replace(/[^\d.,]/g, "").replace(",", ".");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export default function FinanceiroPage() {
  const {
    records,
    allRecords,
    tipoFilter,
    setTipoFilter,
    periodFilter,
    setPeriodFilter,
    isLoading,
    isSaving,
    deletingId,
    isBulkDeleting,
    createRecord,
    findDuplicates,
    importRecords,
    deleteRecord,
    deleteRecords,
  } = useFinanceiro();
  const { clients } = useClients();
  const gastosFixosState = useGastosFixos();
  const gruposState = useFinanceiroGrupos();
  const bancosState = useBancos();
  const { linhas: saldoLinhas, isLoading: isLoadingSaldo, refreshSaldo } = useFinanceiroSaldo();
  const [isSaldoOpen, setIsSaldoOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isGastosFixosOpen, setIsGastosFixosOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isBancosOpen, setIsBancosOpen] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState<FinanceiroRecord | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [descricaoBusca, setDescricaoBusca] = useState("");
  const [valorBusca, setValorBusca] = useState("");

  const filteredRecords = useMemo(() => {
    const normalizedSearch = normalizeText(descricaoBusca);
    const valorAlvo = parseValorBusca(valorBusca);
    const valorMin = valorAlvo !== null ? valorAlvo * 0.9 : null;
    const valorMax = valorAlvo !== null ? valorAlvo * 1.1 : null;

    return records.filter((record) => {
      if (normalizedSearch && !normalizeText(record.descricao ?? "").includes(normalizedSearch)) return false;
      if (valorMin !== null && valorMax !== null && (record.valor < valorMin || record.valor > valorMax)) return false;
      return true;
    });
  }, [records, descricaoBusca, valorBusca]);

  useEffect(() => {
    // Selection only makes sense scoped to the currently filtered/loaded records.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedIds((current) => {
      const validIds = new Set(filteredRecords.map((record) => record.id));
      const next = new Set([...current].filter((id) => validIds.has(id)));
      return next.size === current.size ? current : next;
    });
  }, [filteredRecords]);

  const total = filteredRecords.reduce(
    (sum, record) => sum + (record.tipo === "ganho" ? record.valor : -record.valor),
    0,
  );
  const allSelected = filteredRecords.length > 0 && selectedIds.size === filteredRecords.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  function toggleSelectAll() {
    setSelectedIds(allSelected ? new Set() : new Set(filteredRecords.map((record) => record.id)));
  }

  function toggleSelect(id: string, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function handleExport() {
    const toExport =
      selectedIds.size > 0 ? filteredRecords.filter((record) => selectedIds.has(record.id)) : filteredRecords;
    exportFinanceiroToCsv(
      toExport,
      clients,
      bancosState.bancos,
      `extrato-${new Date().toISOString().slice(0, 10)}.csv`,
    );
  }

  // O saldo acumulado vem de uma RPC própria, então toda escrita no extrato o deixa velho.
  // O refresh não é aguardado de propósito: o toast da operação não deve esperar um segundo round trip.
  async function handleCreateRecord(input: Parameters<typeof createRecord>[0]) {
    const success = await createRecord(input);
    if (success) void refreshSaldo();
    return success;
  }

  async function handleImportRecords(inputs: Parameters<typeof importRecords>[0]) {
    const result = await importRecords(inputs);
    if (result.inserted > 0) void refreshSaldo();
    return result;
  }

  async function handleDeleteRecord(id: string) {
    const success = await deleteRecord(id);
    if (success) void refreshSaldo();
    return success;
  }

  async function handleBulkDelete() {
    const success = await deleteRecords([...selectedIds]);
    if (success) {
      setSelectedIds(new Set());
      void refreshSaldo();
    }
    return success;
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">Financeiro</p>
          <h1 className="text-3xl font-bold tracking-[-0.05em] text-foreground">Extrato</h1>
          <p className="mt-2 text-sm text-muted-foreground">Acompanhe gastos, gastos fixos e ganhos num único lugar.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" className="h-11 px-4 font-bold" onClick={() => setIsBancosOpen(true)}>
            <Building2 />
            Bancos
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 px-4 font-bold"
            onClick={() => setIsGastosFixosOpen(true)}
          >
            <Repeat />
            Gastos fixos
          </Button>
          <Button type="button" variant="outline" className="h-11 px-4 font-bold" onClick={() => setIsImportOpen(true)}>
            <Upload />
            Importar OFX
          </Button>
          <Button type="button" className="h-11 px-4 font-bold" onClick={() => setIsFormOpen(true)}>
            <Plus />
            Novo lançamento
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <FinanceiroSaldoCard linhas={saldoLinhas} isLoading={isLoadingSaldo} onOpen={() => setIsSaldoOpen(true)} />
        <div className="rounded-2xl border bg-background p-5">
          <p className="text-xs font-semibold text-muted-foreground">Saldo do período filtrado</p>
          <p
            className={`mt-4 text-3xl font-black tracking-[-0.06em] ${total < 0 ? "text-rose-700" : "text-foreground"}`}
          >
            {formatCurrency(total)}
          </p>
        </div>
        <div className="flex flex-col justify-center gap-2 rounded-2xl border bg-background p-5">
          <p className="text-xs font-semibold text-muted-foreground">Filtrar por tipo</p>
          <Select.SelectRoot
            value={tipoFilter}
            onValueChange={(value) => setTipoFilter(value as FinanceiroTipo | "all")}
          >
            <Select.SelectTrigger className="h-10 w-full bg-background">
              <Select.SelectValue>{tipoFilter === "all" ? "Todos" : tipoLabels[tipoFilter]}</Select.SelectValue>
            </Select.SelectTrigger>
            <Select.SelectContent>
              <Select.SelectItem value="all">Todos</Select.SelectItem>
              <Select.SelectItem value="gasto">Gasto</Select.SelectItem>
              <Select.SelectItem value="gasto_fixo">Gasto fixo</Select.SelectItem>
              <Select.SelectItem value="ganho">Ganho</Select.SelectItem>
            </Select.SelectContent>
          </Select.SelectRoot>
        </div>
        <div className="rounded-2xl border bg-background p-5">
          <PeriodFilterControl value={periodFilter} onChange={setPeriodFilter} />
        </div>
      </div>

      <FinanceiroGrupos
        grupos={gruposState.grupos}
        records={allRecords}
        isSaving={gruposState.isSaving}
        deletingId={gruposState.deletingId}
        onCreate={gruposState.createGrupo}
        onUpdate={gruposState.updateGrupo}
        onDelete={gruposState.deleteGrupo}
      />

      {isLoading ? (
        <FinanceiroSkeleton />
      ) : (
        <div className="space-y-4 rounded-xl border bg-card p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={descricaoBusca}
                onChange={(event) => setDescricaoBusca(event.target.value)}
                placeholder="Buscar por descrição..."
                aria-label="Buscar por descrição"
                className="h-10 bg-background pl-9"
              />
            </div>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={valorBusca}
                onChange={(event) => setValorBusca(event.target.value)}
                placeholder="Buscar por valor aproximado (±10%)..."
                aria-label="Buscar por valor aproximado"
                inputMode="decimal"
                className="h-10 bg-background pl-9"
              />
            </div>
          </div>

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={filteredRecords.length === 0}
                onClick={toggleSelectAll}
              >
                {allSelected ? "Limpar seleção" : "Selecionar todos"}
              </Button>
              {selectedIds.size > 0 && (
                <p className="text-sm font-semibold text-muted-foreground">
                  {selectedIds.size} selecionado{selectedIds.size === 1 ? "" : "s"}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={filteredRecords.length === 0}
                onClick={handleExport}
              >
                <Download />
                {selectedIds.size > 0 ? "Exportar selecionados" : "Exportar Excel"}
              </Button>
              {selectedIds.size > 0 && (
                <Button type="button" variant="destructive" size="sm" onClick={() => setIsBulkDeleteOpen(true)}>
                  <Trash2 />
                  Excluir selecionados
                </Button>
              )}
            </div>
          </div>

          <Table.TableRoot>
            <Table.TableHeader>
              <Table.TableRow className="hover:bg-transparent">
                <Table.TableHead className="w-10 px-3">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onCheckedChange={toggleSelectAll}
                    disabled={filteredRecords.length === 0}
                    aria-label="Selecionar todos os lançamentos"
                  />
                </Table.TableHead>
                <Table.TableHead className="px-3 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  Data
                </Table.TableHead>
                <Table.TableHead className="px-3 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  Tipo
                </Table.TableHead>
                <Table.TableHead className="px-3 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  Descrição
                </Table.TableHead>
                <Table.TableHead className="px-3 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  Cliente
                </Table.TableHead>
                <Table.TableHead className="px-3 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  Banco
                </Table.TableHead>
                <Table.TableHead className="px-3 text-right text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  Valor
                </Table.TableHead>
                <Table.TableHead className="px-3 text-right text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  Ações
                </Table.TableHead>
              </Table.TableRow>
            </Table.TableHeader>
            <Table.TableBody>
              {filteredRecords.length === 0 ? (
                <Table.TableRow>
                  <Table.TableCell colSpan={8} className="h-40 text-center">
                    <p className="font-semibold">Nenhum lançamento encontrado</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Ajuste o período/tipo/busca, cadastre um lançamento ou importe um extrato OFX.
                    </p>
                  </Table.TableCell>
                </Table.TableRow>
              ) : (
                filteredRecords.map((record) => {
                  const client = clients.find((candidate) => candidate.id === record.cliente_id);
                  const banco = bancosState.bancos.find((candidate) => candidate.id === record.banco_id);
                  return (
                    <Table.TableRow
                      key={record.id}
                      data-selected={selectedIds.has(record.id) || undefined}
                      className="data-selected:bg-accent/60"
                    >
                      <Table.TableCell className="px-3">
                        <Checkbox
                          checked={selectedIds.has(record.id)}
                          onCheckedChange={(checked) => toggleSelect(record.id, checked === true)}
                          aria-label={`Selecionar ${record.descricao ?? "lançamento"}`}
                        />
                      </Table.TableCell>
                      <Table.TableCell className="px-3 py-4 text-muted-foreground">
                        {formatDate(record.data)}
                      </Table.TableCell>
                      <Table.TableCell className="px-3 py-4">
                        <Badge variant="outline" className={tipoStyles[record.tipo]}>
                          {tipoLabels[record.tipo]}
                        </Badge>
                      </Table.TableCell>
                      <Table.TableCell className="px-3 py-4 font-semibold">{record.descricao || "—"}</Table.TableCell>
                      <Table.TableCell className="px-3 py-4 text-muted-foreground">
                        {client?.name ?? "—"}
                      </Table.TableCell>
                      <Table.TableCell className="px-3 py-4 text-muted-foreground">
                        {banco?.nome ?? "—"}
                      </Table.TableCell>
                      <Table.TableCell
                        className={`px-3 py-4 text-right font-semibold ${record.tipo === "ganho" ? "text-emerald-700" : "text-foreground"}`}
                      >
                        {record.tipo === "ganho" ? "+" : "-"}
                        {formatCurrency(record.valor)}
                      </Table.TableCell>
                      <Table.TableCell className="px-3 py-4 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeletingRecord(record)}
                          aria-label={`Excluir ${record.descricao ?? "lançamento"}`}
                        >
                          <Trash2 />
                        </Button>
                      </Table.TableCell>
                    </Table.TableRow>
                  );
                })
              )}
            </Table.TableBody>
          </Table.TableRoot>
        </div>
      )}

      {isSaldoOpen && (
        <FinanceiroSaldoDialog
          linhas={saldoLinhas}
          bancos={bancosState.bancos}
          onOpenChange={(open) => {
            if (!open) setIsSaldoOpen(false);
          }}
        />
      )}
      <FinanceiroFormDialog
        open={isFormOpen}
        clients={clients}
        bancos={bancosState.bancos}
        isSaving={isSaving}
        onOpenChange={setIsFormOpen}
        onSubmit={handleCreateRecord}
      />
      <ImportOfxDialog
        open={isImportOpen}
        clients={clients}
        bancos={bancosState.bancos}
        isSaving={isSaving}
        onOpenChange={setIsImportOpen}
        onFindDuplicates={findDuplicates}
        onImport={handleImportRecords}
      />
      <BancosDialog
        open={isBancosOpen}
        bancos={bancosState.bancos}
        isSaving={bancosState.isSaving}
        deletingId={bancosState.deletingId}
        onOpenChange={setIsBancosOpen}
        onCreate={bancosState.createBanco}
        onDelete={bancosState.deleteBanco}
      />
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
        onOpenChange={(open) => {
          if (!open) setDeletingRecord(null);
        }}
        onConfirm={() => (deletingRecord ? handleDeleteRecord(deletingRecord.id) : Promise.resolve(false))}
      />
      <DeleteFinanceiroDialog
        open={isBulkDeleteOpen}
        count={selectedIds.size}
        isDeleting={isBulkDeleting}
        onOpenChange={setIsBulkDeleteOpen}
        onConfirm={handleBulkDelete}
      />
    </section>
  );
}
