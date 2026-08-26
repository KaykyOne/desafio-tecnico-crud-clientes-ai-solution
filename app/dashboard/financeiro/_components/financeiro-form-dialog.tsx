"use client";

//* Libraries Imports
import { useState, type FormEvent } from "react";

//* Components Imports
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogRoot, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectContent, SelectItem, SelectRoot, SelectTrigger, SelectValue } from "@/components/ui/select";

//* Types Imports
import type { FinanceiroInput } from "@/hooks/use-financeiro";
import type { ClientRecord } from "@/hooks/use-clients";
import type { BancoRecord } from "@/hooks/use-bancos";

type FinanceiroFormDialogProps = {
  open: boolean;
  clients: ClientRecord[];
  bancos: BancoRecord[];
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: FinanceiroInput) => Promise<boolean>;
};

const emptyForm: FinanceiroInput = {
  data: new Date().toISOString().slice(0, 10),
  tipo: "gasto",
  valor: 0,
  descricao: "",
  cliente_id: null,
  banco_id: null,
};

export default function FinanceiroFormDialog({ open, clients, bancos, isSaving, onOpenChange, onSubmit }: FinanceiroFormDialogProps) {
  const [form, setForm] = useState<FinanceiroInput>(emptyForm);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const saved = await onSubmit({ ...form, descricao: form.descricao.trim() });
    if (saved) { setForm(emptyForm); onOpenChange(false); }
  }

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto bg-background p-6 sm:max-w-lg sm:p-8">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-[-0.04em]">Novo lançamento</DialogTitle>
          <DialogDescription>Registre um gasto ou ganho no seu extrato.</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="financeiro-data">Data</Label>
              <Input id="financeiro-data" type="date" required value={form.data} onChange={(event) => setForm((current) => ({ ...current, data: event.target.value }))} className="h-11" />
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <SelectRoot value={form.tipo} onValueChange={(value) => setForm((current) => ({ ...current, tipo: value as FinanceiroInput["tipo"] }))}>
                <SelectTrigger className="h-11 w-full bg-background">
                  <SelectValue>{form.tipo === "gasto" ? "Gasto" : "Ganho"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gasto">Gasto</SelectItem>
                  <SelectItem value="ganho">Ganho</SelectItem>
                </SelectContent>
              </SelectRoot>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="financeiro-valor">Valor</Label>
            <Input id="financeiro-valor" type="number" min="0.01" step="0.01" required value={form.valor || ""} onChange={(event) => setForm((current) => ({ ...current, valor: Number(event.target.value) }))} className="h-11" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="financeiro-descricao">Descrição</Label>
            <Input id="financeiro-descricao" value={form.descricao} onChange={(event) => setForm((current) => ({ ...current, descricao: event.target.value }))} placeholder="Ex.: Almoço com cliente" className="h-11" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Cliente (opcional)</Label>
              <SelectRoot
                value={form.cliente_id ?? "none"}
                onValueChange={(value) => setForm((current) => ({ ...current, cliente_id: value === "none" ? null : value }))}
              >
                <SelectTrigger className="h-11 w-full bg-background">
                  <SelectValue>{clients.find((client) => client.id === form.cliente_id)?.name ?? "Nenhum"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {clients.map((client) => <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>)}
                </SelectContent>
              </SelectRoot>
            </div>

            <div className="space-y-2">
              <Label>Banco (opcional)</Label>
              <SelectRoot
                value={form.banco_id ?? "none"}
                onValueChange={(value) => setForm((current) => ({ ...current, banco_id: value === "none" ? null : value }))}
              >
                <SelectTrigger className="h-11 w-full bg-background">
                  <SelectValue>{bancos.find((banco) => banco.id === form.banco_id)?.nome ?? "Nenhum"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {bancos.map((banco) => <SelectItem key={banco.id} value={banco.id}>{banco.nome}</SelectItem>)}
                </SelectContent>
              </SelectRoot>
            </div>
          </div>

          <DialogFooter className="mt-6 border-t-0 bg-transparent p-0">
            <Button type="button" variant="outline" disabled={isSaving} onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? "Salvando..." : "Cadastrar lançamento"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogRoot>
  );
}
