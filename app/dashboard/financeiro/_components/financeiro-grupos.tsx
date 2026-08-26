"use client";

//* Libraries Imports
import { useState, type KeyboardEvent } from "react";
import { Plus, X } from "lucide-react";

//* Components Imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

//* Types Imports
import type { FinanceiroRecord } from "@/hooks/use-financeiro";
import type { FinanceiroGrupoRecord } from "@/hooks/use-financeiro-grupos";

//* Utils Imports
import { normalizeText } from "@/lib/normalize-text";

import FinanceiroGrupoDialog from "./financeiro-grupo-dialog";

type FinanceiroGruposProps = {
  grupos: FinanceiroGrupoRecord[];
  records: FinanceiroRecord[];
  isSaving: boolean;
  deletingId: string | null;
  onCreate: (termos: string[], nome: string) => Promise<boolean>;
  onUpdate: (id: string, termos: string[], nome: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

/** Lançamentos cuja descrição contém QUALQUER um dos termos, sem diferenciar maiúsculas/minúsculas nem acentos. */
export function matchGrupoRecords(records: FinanceiroRecord[], termos: string[]) {
  const needles = termos.map((termo) => normalizeText(termo)).filter(Boolean);
  if (needles.length === 0) return [];
  return records.filter((record) => {
    const descricao = normalizeText(record.descricao ?? "");
    return needles.some((needle) => descricao.includes(needle));
  });
}

export function sumGrupoRecords(matching: FinanceiroRecord[]) {
  return matching.reduce((sum, record) => sum + (record.tipo === "ganho" ? record.valor : -record.valor), 0);
}

export default function FinanceiroGrupos({ grupos, records, isSaving, deletingId, onCreate, onUpdate, onDelete }: FinanceiroGruposProps) {
  const [newTermo, setNewTermo] = useState("");
  const [pendingTermos, setPendingTermos] = useState<string[]>([]);
  const [pendingNome, setPendingNome] = useState("");
  const [openGrupoId, setOpenGrupoId] = useState<string | null>(null);

  function addPendingTermo() {
    const value = newTermo.trim();
    if (!value || pendingTermos.some((termo) => normalizeText(termo) === normalizeText(value))) return;
    setPendingTermos((current) => [...current, value]);
    setNewTermo("");
  }

  function removePendingTermo(termo: string) {
    setPendingTermos((current) => current.filter((candidate) => candidate !== termo));
  }

  function handleTermoKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addPendingTermo();
    }
  }

  async function handleCreate() {
    if (await onCreate(pendingTermos, pendingNome)) {
      setPendingTermos([]);
      setPendingNome("");
      setNewTermo("");
    }
  }

  const canCreate = pendingTermos.length === 1 || (pendingTermos.length > 1 && pendingNome.trim().length > 0);
  const openGrupo = grupos.find((grupo) => grupo.id === openGrupoId) ?? null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Cards por palavra-chave</p>

      <div className="flex flex-wrap gap-3">
        {grupos.map((grupo) => {
          const total = sumGrupoRecords(matchGrupoRecords(records, grupo.termos));
          const titulo = grupo.nome ?? grupo.termos[0];
          return (
            <button
              key={grupo.id}
              type="button"
              onClick={() => setOpenGrupoId(grupo.id)}
              className="group relative min-w-[10rem] flex-1 rounded-xl border bg-card p-4 text-left shadow-sm transition-colors hover:bg-accent/40 sm:flex-none sm:basis-48"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute top-1.5 right-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                disabled={deletingId === grupo.id}
                onClick={(event) => {
                  event.stopPropagation();
                  void onDelete(grupo.id);
                }}
                aria-label={`Remover card ${titulo}`}
              >
                <X />
              </Button>
              <p className="truncate pr-6 text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground" title={titulo}>
                {titulo}
              </p>
              <p className={`mt-2 text-xl font-black tracking-[-0.04em] ${total < 0 ? "text-rose-700" : "text-foreground"}`}>{formatCurrency(total)}</p>
              <p className="mt-1 text-xs text-muted-foreground">{grupo.termos.length === 1 ? "1 palavra-chave" : `${grupo.termos.length} palavras-chave`}</p>
            </button>
          );
        })}

        <div className="flex min-w-[14rem] flex-1 flex-col gap-2 rounded-xl border border-dashed p-3 sm:flex-none sm:basis-56">
          {pendingTermos.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {pendingTermos.map((termo) => (
                <span key={termo} className="flex items-center gap-1 rounded-full border bg-background px-2 py-0.5 text-xs font-medium">
                  {termo}
                  <button type="button" onClick={() => removePendingTermo(termo)} aria-label={`Remover palavra ${termo}`} className="text-muted-foreground hover:text-foreground">
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Input
              value={newTermo}
              onChange={(event) => setNewTermo(event.target.value)}
              onKeyDown={handleTermoKeyDown}
              placeholder={pendingTermos.length > 0 ? "Outra palavra..." : "Ex.: netflix"}
              aria-label="Palavra-chave do novo card"
              className="h-9 bg-background"
            />
            <Button type="button" size="icon-sm" variant="outline" disabled={!newTermo.trim()} onClick={addPendingTermo} aria-label="Adicionar palavra ao card">
              <Plus />
            </Button>
          </div>

          {pendingTermos.length > 1 && (
            <Input
              value={pendingNome}
              onChange={(event) => setPendingNome(event.target.value)}
              placeholder="Nome do card (Ex.: Assinaturas)"
              aria-label="Nome do novo card"
              className="h-9 bg-background"
            />
          )}

          {pendingTermos.length > 0 && (
            <Button type="button" size="sm" disabled={isSaving || !canCreate} onClick={() => void handleCreate()}>
              {isSaving ? "Salvando..." : "Criar card"}
            </Button>
          )}
        </div>
      </div>

      {openGrupo && (
        <FinanceiroGrupoDialog
          key={openGrupo.id}
          grupo={openGrupo}
          records={records}
          isSaving={isSaving}
          onOpenChange={(open) => { if (!open) setOpenGrupoId(null); }}
          onUpdate={onUpdate}
          onDelete={async (id) => {
            const success = await onDelete(id);
            if (success) setOpenGrupoId(null);
            return success;
          }}
        />
      )}
    </div>
  );
}
