"use client";

//* Libraries Imports
import { useState, type FormEvent } from "react";
import { Trash2, X } from "lucide-react";

//* Components Imports
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogRoot, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectContent, SelectItem, SelectRoot, SelectTrigger, SelectValue } from "@/components/ui/select";

//* Types Imports
import type { BancoRecord } from "@/hooks/use-bancos";

//* Utils Imports
import { BANCOS_BRASILEIROS } from "@/lib/bancos-brasileiros";

type BancosDialogProps = {
  open: boolean;
  bancos: BancoRecord[];
  isSaving: boolean;
  deletingId: string | null;
  onOpenChange: (open: boolean) => void;
  onCreate: (nome: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
};

export default function BancosDialog({ open, bancos, isSaving, deletingId, onOpenChange, onCreate, onDelete }: BancosDialogProps) {
  const [preset, setPreset] = useState("");
  const [nomeCustom, setNomeCustom] = useState("");

  const nomeParaSalvar = nomeCustom.trim() || BANCOS_BRASILEIROS.find((banco) => banco.codigo === preset)?.nome || "";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await onCreate(nomeParaSalvar)) {
      setPreset("");
      setNomeCustom("");
    }
  }

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto bg-background p-6 sm:max-w-lg sm:p-8">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-[-0.04em]">Bancos</DialogTitle>
          <DialogDescription>Cadastre os bancos que você usa pra anexar aos lançamentos e importações.</DialogDescription>
        </DialogHeader>

        <form className="space-y-4 rounded-lg border bg-card p-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label>Escolha um banco conhecido</Label>
            <SelectRoot
              value={preset}
              onValueChange={(value) => {
                setPreset(value ?? "");
                setNomeCustom("");
              }}
            >
              <SelectTrigger className="h-11 w-full bg-background">
                <SelectValue>{BANCOS_BRASILEIROS.find((banco) => banco.codigo === preset)?.nome ?? "Selecione..."}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {BANCOS_BRASILEIROS.map((banco) => (
                  <SelectItem key={banco.codigo} value={banco.codigo}>{banco.nome}</SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </div>

          <div className="space-y-2">
            <Label htmlFor="banco-custom">Não achou? Digite o nome do banco</Label>
            <Input
              id="banco-custom"
              value={nomeCustom}
              onChange={(event) => {
                setNomeCustom(event.target.value);
                if (event.target.value) setPreset("");
              }}
              placeholder="Ex.: Cooperativa de Crédito X"
              className="h-11"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving || !nomeParaSalvar}>{isSaving ? "Salvando..." : "Adicionar banco"}</Button>
          </div>
        </form>

        <ul className="space-y-2">
          {bancos.length === 0 && <li className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">Nenhum banco cadastrado.</li>}
          {bancos.map((banco) => (
            <li key={banco.id} className="flex items-center gap-3 rounded-lg border bg-background p-3">
              <p className="min-w-0 flex-1 truncate text-sm font-medium">{banco.nome}</p>
              <Button type="button" variant="ghost" size="icon-sm" disabled={deletingId === banco.id} onClick={() => void onDelete(banco.id)} aria-label={`Excluir ${banco.nome}`}><Trash2 /></Button>
            </li>
          ))}
        </ul>

        <DialogFooter className="mt-2 border-t-0 bg-transparent p-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}><X />Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
