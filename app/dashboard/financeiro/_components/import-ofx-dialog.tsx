"use client";

//* Libraries Imports
import { useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { TrendingDown, TrendingUp, Upload } from "lucide-react";

//* Components Imports
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogRoot, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectContent, SelectItem, SelectRoot, SelectTrigger, SelectValue } from "@/components/ui/select";

//* Types Imports
import type { BancoRecord } from "@/hooks/use-bancos";
import type { ClientRecord } from "@/hooks/use-clients";
import type { FinanceiroInput } from "@/hooks/use-financeiro";
import { parseOfxFile, type OfxGroup } from "@/lib/ofx";

//* Utils Imports
import { cn } from "@/lib/utils";

type ReviewState = { include: boolean; tipo: "gasto" | "ganho"; cliente_id: string | null };

type ImportOfxDialogProps = {
  open: boolean;
  clients: ClientRecord[];
  bancos: BancoRecord[];
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onFindDuplicates: (inputs: FinanceiroInput[]) => Promise<FinanceiroInput[]>;
  onImport: (inputs: FinanceiroInput[]) => Promise<{ inserted: number; skipped: number }>;
};

const toneStyles = {
  ganho: { border: "border-l-emerald-400", text: "text-emerald-700", sign: "+" },
  gasto: { border: "border-l-rose-400", text: "text-rose-700", sign: "-" },
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(`${date}T00:00:00`));
}

function sumIncluded(groups: OfxGroup[], review: Record<string, ReviewState>) {
  return groups.reduce((sum, group) => (review[group.key]?.include ? sum + group.valor * group.transactions.length : sum), 0);
}

type GroupCardProps = {
  group: OfxGroup;
  review: ReviewState;
  clients: ClientRecord[];
  onUpdate: (patch: Partial<ReviewState>) => void;
};

function GroupCard({ group, review, clients, onUpdate }: GroupCardProps) {
  const tone = toneStyles[review.tipo];
  const total = group.valor * group.transactions.length;

  return (
    <div className={cn("rounded-lg border border-l-4 bg-card p-4", tone.border)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Checkbox checked={review.include} onCheckedChange={(checked) => onUpdate({ include: checked === true })} className="mt-1" />
          <div>
            <p className="font-medium">{group.descricao}</p>
            <p className="text-xs text-muted-foreground">
              {group.transactions.length === 1 ? "1 transação" : `${group.transactions.length} transações`} · {formatCurrency(group.valor)} {group.transactions.length > 1 && "cada"}
            </p>
          </div>
        </div>
        <p className={cn("shrink-0 text-sm font-semibold", tone.text)}>{tone.sign}{formatCurrency(total)}</p>
      </div>

      {review.include && (
        <div className="mt-3 grid gap-3 pl-7 sm:grid-cols-2">
          <SelectRoot value={review.tipo} onValueChange={(value) => onUpdate({ tipo: value as "gasto" | "ganho" })}>
            <SelectTrigger className="h-10 w-full bg-background">
              <SelectValue>{review.tipo === "gasto" ? "Saída" : "Ganho"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gasto">Saída</SelectItem>
              <SelectItem value="ganho">Ganho</SelectItem>
            </SelectContent>
          </SelectRoot>

          <SelectRoot value={review.cliente_id ?? "none"} onValueChange={(value) => onUpdate({ cliente_id: value === "none" ? null : value })}>
            <SelectTrigger className="h-10 w-full bg-background">
              <SelectValue>{clients.find((client) => client.id === review.cliente_id)?.name ?? "Nenhum cliente"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum cliente</SelectItem>
              {clients.map((client) => <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>)}
            </SelectContent>
          </SelectRoot>
        </div>
      )}
    </div>
  );
}

export default function ImportOfxDialog({ open, clients, bancos, isSaving, onOpenChange, onFindDuplicates, onImport }: ImportOfxDialogProps) {
  const [groups, setGroups] = useState<OfxGroup[]>([]);
  const [review, setReview] = useState<Record<string, ReviewState>>({});
  const [bancoId, setBancoId] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [duplicates, setDuplicates] = useState<FinanceiroInput[] | null>(null);
  const [pendingUniqueInputs, setPendingUniqueInputs] = useState<FinanceiroInput[]>([]);
  const [selectedDuplicates, setSelectedDuplicates] = useState<Set<number>>(new Set());

  function reset() {
    setGroups([]);
    setReview({});
    setBancoId(null);
    setDuplicates(null);
    setPendingUniqueInputs([]);
    setSelectedDuplicates(new Set());
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsParsing(true);
    try {
      const parsedGroups = await parseOfxFile(file);
      setGroups(parsedGroups);
      setReview(Object.fromEntries(parsedGroups.map((group) => [group.key, { include: true, tipo: group.tipoSugerido, cliente_id: null }])));
    } catch (error) {
      toast.error("Não foi possível ler esse arquivo OFX", {
        description: error instanceof Error ? error.message : "Confira se o arquivo exportado pelo banco não está corrompido.",
      });
      console.error("Erro ao processar OFX:", error);
    } finally {
      setIsParsing(false);
    }
  }

  function updateReview(key: string, patch: Partial<ReviewState>) {
    setReview((current) => ({ ...current, [key]: { ...current[key], ...patch } }));
  }

  async function finalizeImport(inputsToImport: FinanceiroInput[]) {
    const result = await onImport(inputsToImport);
    if (result.inserted > 0) handleOpenChange(false);
  }

  async function handleImport() {
    const inputs: FinanceiroInput[] = groups.flatMap((group) => {
      const groupReview = review[group.key];
      if (!groupReview?.include) return [];
      return group.transactions.map((transaction) => ({
        data: transaction.data,
        tipo: groupReview.tipo,
        valor: transaction.valor,
        descricao: transaction.descricao,
        cliente_id: groupReview.cliente_id,
        banco_id: bancoId,
        fitid: transaction.fitid,
      }));
    });

    if (inputs.length === 0) {
      toast.error("Selecione ao menos um lançamento para importar");
      return;
    }

    setIsCheckingDuplicates(true);
    const duplicateInputs = await onFindDuplicates(inputs);
    setIsCheckingDuplicates(false);

    if (duplicateInputs.length > 0) {
      setDuplicates(duplicateInputs);
      setPendingUniqueInputs(inputs.filter((input) => !duplicateInputs.includes(input)));
      setSelectedDuplicates(new Set());
      return;
    }

    await finalizeImport(inputs);
  }

  function toggleDuplicate(index: number, checked: boolean) {
    setSelectedDuplicates((current) => {
      const next = new Set(current);
      if (checked) next.add(index);
      else next.delete(index);
      return next;
    });
  }

  async function handleConfirmDuplicates() {
    if (!duplicates) return;
    const selected = duplicates.filter((_, index) => selectedDuplicates.has(index));
    await finalizeImport([...pendingUniqueInputs, ...selected]);
  }

  async function handleIgnoreDuplicates() {
    if (pendingUniqueInputs.length === 0) {
      toast.info("Nenhum lançamento novo para importar");
      handleOpenChange(false);
      return;
    }
    await finalizeImport(pendingUniqueInputs);
  }

  const includedCount = groups.reduce((total, group) => total + (review[group.key]?.include ? group.transactions.length : 0), 0);
  const ganhoGroups = groups.filter((group) => review[group.key]?.tipo === "ganho");
  const gastoGroups = groups.filter((group) => review[group.key]?.tipo === "gasto");
  const totalGanhos = sumIncluded(ganhoGroups, review);
  const totalGastos = sumIncluded(gastoGroups, review);

  return (
    <DialogRoot open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto bg-background p-6 sm:max-w-3xl sm:p-8">
        <DialogHeader>
          {duplicates ? (
            <>
              <DialogTitle className="text-xl font-bold tracking-[-0.04em]">Lançamentos parecidos já existem</DialogTitle>
              <DialogDescription>
                Encontramos {duplicates.length} lançamento{duplicates.length === 1 ? "" : "s"} com a mesma data, valor e descrição de algo que já está no seu extrato. Selecione os que quer importar mesmo assim, ou ignore todos.
              </DialogDescription>
            </>
          ) : (
            <>
              <DialogTitle className="text-xl font-bold tracking-[-0.04em]">Importar extrato OFX</DialogTitle>
              <DialogDescription>Selecione o arquivo exportado pelo seu banco. Transações parecidas são agrupadas para você revisar de uma vez.</DialogDescription>
            </>
          )}
        </DialogHeader>

        {duplicates ? (
          <ul className="space-y-2">
            {duplicates.map((duplicate, index) => (
              <li key={index} className="flex items-center gap-3 rounded-lg border bg-card p-3">
                <Checkbox checked={selectedDuplicates.has(index)} onCheckedChange={(checked) => toggleDuplicate(index, checked === true)} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{duplicate.descricao || "Sem descrição"}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(duplicate.data)} · {formatCurrency(duplicate.valor)} · {duplicate.tipo === "gasto" ? "Saída" : "Ganho"}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : groups.length === 0 ? (
          <div className="space-y-2">
            <Label htmlFor="ofx-file">Arquivo .ofx</Label>
            <Input id="ofx-file" type="file" accept=".ofx,.qfx" disabled={isParsing} onChange={(event) => void handleFileChange(event)} className="h-11" />
            {isParsing && <p className="text-sm text-muted-foreground">Lendo arquivo...</p>}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Esses dados são de qual banco? (opcional)</Label>
              <SelectRoot value={bancoId ?? "none"} onValueChange={(value) => setBancoId(value === "none" ? null : value)}>
                <SelectTrigger className="h-10 w-full bg-background sm:max-w-xs">
                  <SelectValue>{bancos.find((banco) => banco.id === bancoId)?.nome ?? "Não quero informar o banco"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Não quero informar o banco</SelectItem>
                  {bancos.map((banco) => <SelectItem key={banco.id} value={banco.id}>{banco.nome}</SelectItem>)}
                </SelectContent>
              </SelectRoot>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <div className="flex items-center gap-2 text-emerald-800"><TrendingUp className="size-4" /><span className="text-xs font-bold uppercase tracking-[0.1em]">Ganhos</span></div>
                <p className="mt-1 text-lg font-black text-emerald-800">+{formatCurrency(totalGanhos)}</p>
              </div>
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
                <div className="flex items-center gap-2 text-rose-800"><TrendingDown className="size-4" /><span className="text-xs font-bold uppercase tracking-[0.1em]">Saídas</span></div>
                <p className="mt-1 text-lg font-black text-rose-800">-{formatCurrency(totalGastos)}</p>
              </div>
            </div>

            {ganhoGroups.length > 0 && (
              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-800"><TrendingUp className="size-4" />Ganhos ({ganhoGroups.length})</h3>
                {ganhoGroups.map((group) => (
                  <GroupCard key={group.key} group={group} review={review[group.key]} clients={clients} onUpdate={(patch) => updateReview(group.key, patch)} />
                ))}
              </div>
            )}

            {gastoGroups.length > 0 && (
              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-bold text-rose-800"><TrendingDown className="size-4" />Saídas ({gastoGroups.length})</h3>
                {gastoGroups.map((group) => (
                  <GroupCard key={group.key} group={group} review={review[group.key]} clients={clients} onUpdate={(patch) => updateReview(group.key, patch)} />
                ))}
              </div>
            )}
          </div>
        )}

        <DialogFooter className="mt-4 border-t-0 bg-transparent p-0">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancelar</Button>
          {duplicates ? (
            <>
              <Button type="button" variant="outline" disabled={isSaving} onClick={() => void handleIgnoreDuplicates()}>Ignorar duplicados</Button>
              <Button type="button" disabled={isSaving || (pendingUniqueInputs.length === 0 && selectedDuplicates.size === 0)} onClick={() => void handleConfirmDuplicates()}>
                <Upload />{isSaving ? "Importando..." : "Importar selecionados"}
              </Button>
            </>
          ) : (
            groups.length > 0 && (
              <Button type="button" disabled={isSaving || isCheckingDuplicates || includedCount === 0} onClick={() => void handleImport()}>
                <Upload />{isCheckingDuplicates ? "Checando duplicados..." : isSaving ? "Importando..." : `Importar ${includedCount} lançamento${includedCount === 1 ? "" : "s"}`}
              </Button>
            )
          )}
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
