"use client";

//* Components Imports
import Button from "@/components/ui/button";
import Dialog from "@/components/ui/dialog";
import Input from "@/components/ui/input";
import Label from "@/components/ui/label";
import Switch from "@/components/ui/switch";

//* Libraries Imports
import { useState, type FormEvent } from "react";
import { Pencil, Trash2, X } from "lucide-react";

//* Types Imports
import type { GastoFixoInput, GastoFixoRecord } from "@/hooks/use-gastos-fixos";

//* Utils Imports
import { formatCurrency } from "@/lib/format-currency";

type GastosFixosDialogProps = {
  open: boolean;
  gastosFixos: GastoFixoRecord[];
  isSaving: boolean;
  deletingId: string | null;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: GastoFixoInput) => Promise<boolean>;
  onUpdate: (id: string, input: GastoFixoInput) => Promise<boolean>;
  onToggleAtivo: (id: string, ativo: boolean) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
};

const emptyForm: GastoFixoInput = {
  descricao: "",
  valor: 0,
  dia_cobranca: 1,
  data_inicio: new Date().toISOString().slice(0, 10),
  data_fim: null,
};

export function GastosFixosDialog({
  open,
  gastosFixos,
  isSaving,
  deletingId,
  onOpenChange,
  onCreate,
  onUpdate,
  onToggleAtivo,
  onDelete,
}: GastosFixosDialogProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GastoFixoInput>(emptyForm);
  const isEditing = editingId !== null;

  function startEdit(gasto: GastoFixoRecord) {
    setEditingId(gasto.id);
    setForm({
      descricao: gasto.descricao ?? "",
      valor: gasto.valor,
      dia_cobranca: gasto.dia_cobranca,
      data_inicio: gasto.data_inicio,
      data_fim: gasto.data_fim,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = { ...form, descricao: form.descricao.trim() };
    const saved = editingId ? await onUpdate(editingId, input) : await onCreate(input);
    if (saved) cancelEdit();
  }

  return (
    <Dialog.DialogRoot open={open} onOpenChange={onOpenChange}>
      <Dialog.DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto bg-background p-6 sm:max-w-2xl sm:p-8">
        <Dialog.DialogHeader>
          <Dialog.DialogTitle className="text-xl font-bold tracking-[-0.04em]">Gastos fixos</Dialog.DialogTitle>
          <Dialog.DialogDescription>
            Enquanto ativos, geram um lançamento automático no dia de cobrança de cada mês.
          </Dialog.DialogDescription>
        </Dialog.DialogHeader>

        <form className="space-y-4 rounded-lg border bg-card p-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="gasto-fixo-descricao">Descrição</Label>
              <Input
                id="gasto-fixo-descricao"
                value={form.descricao}
                onChange={(event) => setForm((current) => ({ ...current, descricao: event.target.value }))}
                placeholder="Ex.: Aluguel"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gasto-fixo-valor">Valor</Label>
              <Input
                id="gasto-fixo-valor"
                type="number"
                min="0.01"
                step="0.01"
                required
                value={form.valor || ""}
                onChange={(event) => setForm((current) => ({ ...current, valor: Number(event.target.value) }))}
                className="h-11"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="gasto-fixo-dia">Dia de cobrança</Label>
              <Input
                id="gasto-fixo-dia"
                type="number"
                min="1"
                max="31"
                required
                value={form.dia_cobranca}
                onChange={(event) => setForm((current) => ({ ...current, dia_cobranca: Number(event.target.value) }))}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gasto-fixo-inicio">Data de início</Label>
              <Input
                id="gasto-fixo-inicio"
                type="date"
                required
                value={form.data_inicio}
                onChange={(event) => setForm((current) => ({ ...current, data_inicio: event.target.value }))}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gasto-fixo-fim">Data de fim (opcional)</Label>
              <Input
                id="gasto-fixo-fim"
                type="date"
                value={form.data_fim ?? ""}
                onChange={(event) => setForm((current) => ({ ...current, data_fim: event.target.value || null }))}
                className="h-11"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            {isEditing && (
              <Button type="button" variant="outline" disabled={isSaving} onClick={cancelEdit}>
                Cancelar edição
              </Button>
            )}
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Salvando..." : isEditing ? "Salvar alterações" : "Adicionar gasto fixo"}
            </Button>
          </div>
        </form>

        <ul className="space-y-2">
          {gastosFixos.length === 0 && (
            <li className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
              Nenhum gasto fixo cadastrado.
            </li>
          )}
          {gastosFixos.map((gasto) => (
            <li key={gasto.id} className="flex items-center gap-3 rounded-lg border bg-background p-3">
              <Switch
                checked={gasto.ativo}
                onCheckedChange={(checked) => void onToggleAtivo(gasto.id, checked)}
                aria-label={`${gasto.ativo ? "Desativar" : "Ativar"} ${gasto.descricao ?? "gasto fixo"}`}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{gasto.descricao || "Sem descrição"}</p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(gasto.valor)} · todo dia {gasto.dia_cobranca}
                  {!gasto.ativo && " · inativo"}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => startEdit(gasto)}
                aria-label={`Editar ${gasto.descricao ?? "gasto fixo"}`}
              >
                <Pencil />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={deletingId === gasto.id}
                onClick={() => void onDelete(gasto.id)}
                aria-label={`Excluir ${gasto.descricao ?? "gasto fixo"}`}
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>

        <Dialog.DialogFooter className="mt-2 border-t-0 bg-transparent p-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            <X />
            Fechar
          </Button>
        </Dialog.DialogFooter>
      </Dialog.DialogContent>
    </Dialog.DialogRoot>
  );
}
