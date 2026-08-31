"use client";

//* Components Imports
import Button from "@/components/ui/button";
import Dialog from "@/components/ui/dialog";
import Input from "@/components/ui/input";
import Label from "@/components/ui/label";

import { matchGrupoRecords, sumGrupoRecords } from "./financeiro-grupos";

//* Libraries Imports
import { useState, type KeyboardEvent } from "react";
import { Plus, Trash2, X } from "lucide-react";

//* Types Imports
import type { FinanceiroRecord } from "@/hooks/use-financeiro";
import type { FinanceiroGrupoRecord } from "@/hooks/use-financeiro-grupos";

//* Utils Imports
import { formatCurrency } from "@/lib/format-currency";
import { formatDate } from "@/lib/format-date";
import { normalizeText } from "@/lib/normalize-text";

type FinanceiroGrupoDialogProps = {
  grupo: FinanceiroGrupoRecord;
  records: FinanceiroRecord[];
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, termos: string[], nome: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
};

export function FinanceiroGrupoDialog({
  grupo,
  records,
  isSaving,
  onOpenChange,
  onUpdate,
  onDelete,
}: FinanceiroGrupoDialogProps) {
  const [termos, setTermos] = useState<string[]>(grupo.termos);
  const [nome, setNome] = useState(grupo.nome ?? "");
  const [newTermo, setNewTermo] = useState("");

  function addTermo() {
    const value = newTermo.trim();
    if (!value || termos.some((termo) => normalizeText(termo) === normalizeText(value))) return;
    setTermos((current) => [...current, value]);
    setNewTermo("");
  }

  function removeTermo(termo: string) {
    setTermos((current) => current.filter((candidate) => candidate !== termo));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTermo();
    }
  }

  const matching = matchGrupoRecords(records, termos);
  const total = sumGrupoRecords(matching);
  const canSave = termos.length === 1 || (termos.length > 1 && nome.trim().length > 0);

  async function handleSave() {
    if (await onUpdate(grupo.id, termos, nome)) onOpenChange(false);
  }

  return (
    <Dialog.DialogRoot open onOpenChange={onOpenChange}>
      <Dialog.DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto bg-background p-6 sm:max-w-lg sm:p-8">
        <Dialog.DialogHeader className="min-w-0">
          <Dialog.DialogTitle className="text-xl font-bold tracking-[-0.04em] break-words">
            {grupo.nome ?? grupo.termos[0]}
          </Dialog.DialogTitle>
          <Dialog.DialogDescription>
            Ajuste as palavras-chave e veja quais lançamentos entram na soma.
          </Dialog.DialogDescription>
        </Dialog.DialogHeader>

        <div className={`min-w-0 rounded-xl border bg-muted p-4 ${total < 0 ? "text-rose-700" : "text-foreground"}`}>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] opacity-75">Total</p>
          <p className="mt-1 text-2xl font-black tracking-[-0.04em]">{formatCurrency(total)}</p>
          <p className="mt-1 text-xs opacity-75">
            {matching.length === 0
              ? "Nenhum lançamento"
              : matching.length === 1
                ? "1 lançamento"
                : `${matching.length} lançamentos`}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="min-w-0 space-y-2">
            <Label>Palavras-chave</Label>
            <div className="flex flex-wrap gap-1.5">
              {termos.map((termo) => (
                <span
                  key={termo}
                  className="flex items-center gap-1 rounded-full border bg-card px-2 py-0.5 text-xs font-medium"
                >
                  {termo}
                  <button
                    type="button"
                    onClick={() => removeTermo(termo)}
                    aria-label={`Remover palavra ${termo}`}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={newTermo}
                onChange={(event) => setNewTermo(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Adicionar palavra..."
                aria-label="Nova palavra-chave"
                className="h-9 bg-background"
              />
              <Button
                type="button"
                size="icon-sm"
                variant="outline"
                disabled={!newTermo.trim()}
                onClick={addTermo}
                aria-label="Adicionar palavra"
              >
                <Plus />
              </Button>
            </div>
          </div>
          <div>
            {termos.length > 1 && (
              <div className="min-w-0 space-y-2">
                <Label htmlFor="grupo-nome">Nome do card</Label>
                <Input
                  id="grupo-nome"
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  placeholder="Ex.: Assinaturas"
                  className="h-10 bg-background"
                />
              </div>
            )}

            {matching.length > 0 && (
              <div className="min-w-0 space-y-2">
                <Label>Lançamentos usados no cálculo</Label>
                <ul className="max-h-48 min-w-0 space-y-1.5 overflow-y-auto rounded-lg border p-2">
                  {matching.map((record) => (
                    <li
                      key={record.id}
                      className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">{record.descricao || "Sem descrição"}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(record.data)}</p>
                      </div>
                      <p
                        className={`shrink-0 font-semibold ${record.tipo === "ganho" ? "text-emerald-700" : "text-foreground"}`}
                      >
                        {record.tipo === "ganho" ? "+" : "-"}
                        {formatCurrency(record.valor)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <Dialog.DialogFooter className="mt-2 min-w-0 flex-wrap border-t-0 bg-transparent p-0 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            disabled={isSaving}
            onClick={() => void onDelete(grupo.id)}
          >
            <Trash2 />
            Excluir card
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
            <Button type="button" disabled={isSaving || !canSave} onClick={() => void handleSave()}>
              {isSaving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </Dialog.DialogFooter>
      </Dialog.DialogContent>
    </Dialog.DialogRoot>
  );
}
