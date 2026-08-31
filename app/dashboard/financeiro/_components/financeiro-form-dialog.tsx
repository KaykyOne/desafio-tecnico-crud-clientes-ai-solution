"use client";

//* Components Imports
import Button from "@/components/ui/button";
import Dialog from "@/components/ui/dialog";
import Input from "@/components/ui/input";
import Label from "@/components/ui/label";
import Select from "@/components/ui/select";

//* Libraries Imports
import { useState, type FormEvent } from "react";

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

export function FinanceiroFormDialog({
  open,
  clients,
  bancos,
  isSaving,
  onOpenChange,
  onSubmit,
}: FinanceiroFormDialogProps) {
  const [form, setForm] = useState<FinanceiroInput>(emptyForm);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const saved = await onSubmit({ ...form, descricao: form.descricao.trim() });
    if (saved) {
      setForm(emptyForm);
      onOpenChange(false);
    }
  }

  return (
    <Dialog.DialogRoot open={open} onOpenChange={onOpenChange}>
      <Dialog.DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto bg-background p-6 sm:max-w-lg sm:p-8">
        <Dialog.DialogHeader>
          <Dialog.DialogTitle className="text-xl font-bold tracking-[-0.04em]">Novo lançamento</Dialog.DialogTitle>
          <Dialog.DialogDescription>Registre um gasto ou ganho no seu extrato.</Dialog.DialogDescription>
        </Dialog.DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="financeiro-data">Data</Label>
              <Input
                id="financeiro-data"
                type="date"
                required
                value={form.data}
                onChange={(event) => setForm((current) => ({ ...current, data: event.target.value }))}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select.SelectRoot
                value={form.tipo}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, tipo: value as FinanceiroInput["tipo"] }))
                }
              >
                <Select.SelectTrigger className="h-11 w-full bg-background">
                  <Select.SelectValue>{form.tipo === "gasto" ? "Gasto" : "Ganho"}</Select.SelectValue>
                </Select.SelectTrigger>
                <Select.SelectContent>
                  <Select.SelectItem value="gasto">Gasto</Select.SelectItem>
                  <Select.SelectItem value="ganho">Ganho</Select.SelectItem>
                </Select.SelectContent>
              </Select.SelectRoot>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="financeiro-valor">Valor</Label>
            <Input
              id="financeiro-valor"
              type="number"
              min="0.01"
              step="0.01"
              required
              value={form.valor || ""}
              onChange={(event) => setForm((current) => ({ ...current, valor: Number(event.target.value) }))}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="financeiro-descricao">Descrição</Label>
            <Input
              id="financeiro-descricao"
              value={form.descricao}
              onChange={(event) => setForm((current) => ({ ...current, descricao: event.target.value }))}
              placeholder="Ex.: Almoço com cliente"
              className="h-11"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Cliente (opcional)</Label>
              <Select.SelectRoot
                value={form.cliente_id ?? "none"}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, cliente_id: value === "none" ? null : value }))
                }
              >
                <Select.SelectTrigger className="h-11 w-full bg-background">
                  <Select.SelectValue>
                    {clients.find((client) => client.id === form.cliente_id)?.name ?? "Nenhum"}
                  </Select.SelectValue>
                </Select.SelectTrigger>
                <Select.SelectContent>
                  <Select.SelectItem value="none">Nenhum</Select.SelectItem>
                  {clients.map((client) => (
                    <Select.SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </Select.SelectItem>
                  ))}
                </Select.SelectContent>
              </Select.SelectRoot>
            </div>

            <div className="space-y-2">
              <Label>Banco (opcional)</Label>
              <Select.SelectRoot
                value={form.banco_id ?? "none"}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, banco_id: value === "none" ? null : value }))
                }
              >
                <Select.SelectTrigger className="h-11 w-full bg-background">
                  <Select.SelectValue>
                    {bancos.find((banco) => banco.id === form.banco_id)?.nome ?? "Nenhum"}
                  </Select.SelectValue>
                </Select.SelectTrigger>
                <Select.SelectContent>
                  <Select.SelectItem value="none">Nenhum</Select.SelectItem>
                  {bancos.map((banco) => (
                    <Select.SelectItem key={banco.id} value={banco.id}>
                      {banco.nome}
                    </Select.SelectItem>
                  ))}
                </Select.SelectContent>
              </Select.SelectRoot>
            </div>
          </div>

          <Dialog.DialogFooter className="mt-6 border-t-0 bg-transparent p-0">
            <Button type="button" variant="outline" disabled={isSaving} onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Salvando..." : "Cadastrar lançamento"}
            </Button>
          </Dialog.DialogFooter>
        </form>
      </Dialog.DialogContent>
    </Dialog.DialogRoot>
  );
}
