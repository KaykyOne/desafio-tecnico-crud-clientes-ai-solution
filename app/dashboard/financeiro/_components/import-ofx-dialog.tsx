"use client";

//* Libraries Imports
import { useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";

//* Components Imports
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogRoot, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectContent, SelectItem, SelectRoot, SelectTrigger, SelectValue } from "@/components/ui/select";

//* Types Imports
import type { ClientRecord } from "@/hooks/use-clients";
import type { FinanceiroInput } from "@/hooks/use-financeiro";
import { parseOfxFile, type OfxGroup } from "@/lib/ofx";

type ReviewState = { include: boolean; tipo: "gasto" | "ganho"; cliente_id: string | null };

type ImportOfxDialogProps = {
  open: boolean;
  clients: ClientRecord[];
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (inputs: FinanceiroInput[]) => Promise<{ inserted: number; skipped: number }>;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function ImportOfxDialog({ open, clients, isSaving, onOpenChange, onImport }: ImportOfxDialogProps) {
  const [groups, setGroups] = useState<OfxGroup[]>([]);
  const [review, setReview] = useState<Record<string, ReviewState>>({});
  const [isParsing, setIsParsing] = useState(false);

  function reset() {
    setGroups([]);
    setReview({});
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
        fitid: transaction.fitid,
      }));
    });

    if (inputs.length === 0) {
      toast.error("Selecione ao menos um lançamento para importar");
      return;
    }

    const result = await onImport(inputs);
    if (result.inserted > 0) handleOpenChange(false);
  }

  const includedCount = groups.reduce((total, group) => total + (review[group.key]?.include ? group.transactions.length : 0), 0);

  return (
    <DialogRoot open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto bg-background p-6 sm:max-w-3xl sm:p-8">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-[-0.04em]">Importar extrato OFX</DialogTitle>
          <DialogDescription>Selecione o arquivo exportado pelo seu banco. Transações parecidas são agrupadas para você revisar de uma vez.</DialogDescription>
        </DialogHeader>

        {groups.length === 0 ? (
          <div className="space-y-2">
            <Label htmlFor="ofx-file">Arquivo .ofx</Label>
            <Input id="ofx-file" type="file" accept=".ofx,.qfx" disabled={isParsing} onChange={(event) => void handleFileChange(event)} className="h-11" />
            {isParsing && <p className="text-sm text-muted-foreground">Lendo arquivo...</p>}
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((group) => {
              const groupReview = review[group.key];
              const total = group.valor * group.transactions.length;

              return (
                <div key={group.key} className="rounded-lg border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Checkbox checked={groupReview.include} onCheckedChange={(checked) => updateReview(group.key, { include: checked === true })} className="mt-1" />
                      <div>
                        <p className="font-medium">{group.descricao}</p>
                        <p className="text-xs text-muted-foreground">
                          {group.transactions.length === 1 ? "1 transação" : `${group.transactions.length} transações`} · {formatCurrency(group.valor)} {group.transactions.length > 1 && "cada"}
                        </p>
                      </div>
                    </div>
                    <p className="shrink-0 text-sm font-semibold">{formatCurrency(total)}</p>
                  </div>

                  {groupReview.include && (
                    <div className="mt-3 grid gap-3 pl-7 sm:grid-cols-2">
                      <SelectRoot value={groupReview.tipo} onValueChange={(value) => updateReview(group.key, { tipo: value as "gasto" | "ganho" })}>
                        <SelectTrigger className="h-10 w-full bg-background">
                          <SelectValue>{groupReview.tipo === "gasto" ? "Gasto" : "Ganho"}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gasto">Gasto</SelectItem>
                          <SelectItem value="ganho">Ganho</SelectItem>
                        </SelectContent>
                      </SelectRoot>

                      <SelectRoot value={groupReview.cliente_id ?? "none"} onValueChange={(value) => updateReview(group.key, { cliente_id: value === "none" ? null : value })}>
                        <SelectTrigger className="h-10 w-full bg-background">
                          <SelectValue>{clients.find((client) => client.id === groupReview.cliente_id)?.name ?? "Nenhum cliente"}</SelectValue>
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
            })}
          </div>
        )}

        <DialogFooter className="mt-4 border-t-0 bg-transparent p-0">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancelar</Button>
          {groups.length > 0 && (
            <Button type="button" disabled={isSaving || includedCount === 0} onClick={() => void handleImport()}>
              <Upload />{isSaving ? "Importando..." : `Importar ${includedCount} lançamento${includedCount === 1 ? "" : "s"}`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
