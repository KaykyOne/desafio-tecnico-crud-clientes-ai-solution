"use client";

//* Libraries Imports
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

//* Services Imports
import { get, post, remove, upsertIgnoring } from "@/services/api-service";
import { getAuthenticatedUserId } from "@/services/auth-service";

//* Utils Imports
import { getApiErrorMessage, isUniqueViolation } from "@/lib/api-error";

export type FinanceiroTipo = "gasto" | "gasto_fixo" | "ganho";

export type FinanceiroRecord = {
  id: string;
  user_id: string;
  data: string;
  tipo: FinanceiroTipo;
  valor: number;
  descricao: string | null;
  cliente_id: string | null;
  gasto_fixo_id: string | null;
  banco_id: string | null;
  fitid: string | null;
  created_at: string;
};

export type FinanceiroInput = {
  data: string;
  tipo: "gasto" | "ganho";
  valor: number;
  descricao: string;
  cliente_id: string | null;
  banco_id: string | null;
  fitid?: string | null;
};

export type PeriodFilter = { mode: "month"; month: string } | { mode: "range"; start: string; end: string };

const TABLE = "financeiro";
const SELECT_COLUMNS = "id,user_id,data,tipo,valor,descricao,cliente_id,gasto_fixo_id,banco_id,fitid,created_at";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function getCurrentMonthValue() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
}

export function getPeriodRange(period: PeriodFilter) {
  if (period.mode === "range") return { start: period.start, end: period.end };

  const [year, month] = period.month.split("-").map(Number);
  const start = `${period.month}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${period.month}-${pad(lastDay)}`;
  return { start, end };
}

/** Últimos `days` dias contando hoje, no formato que o `PeriodFilter` espera. */
export function getLastDaysPeriod(days: number): PeriodFilter {
  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - (days - 1));
  const toIso = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return { mode: "range", start: toIso(start), end: toIso(end) };
}

function duplicateKey(data: string, valor: number, descricao: string) {
  return `${data}::${valor.toFixed(2)}::${descricao.trim().toLowerCase()}`;
}

export function useFinanceiro(initialPeriod?: PeriodFilter) {
  const [allRecords, setAllRecords] = useState<FinanceiroRecord[]>([]);
  const [tipoFilter, setTipoFilter] = useState<FinanceiroTipo | "all">("all");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>(
    initialPeriod ?? { mode: "month", month: getCurrentMonthValue() },
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Buscado por período (não por tipo), pra que os cards agrupados por termo vejam todos os tipos.
  const fetchRecords = useCallback(async () => {
    setIsLoading(true);

    try {
      const userId = await getAuthenticatedUserId();
      const { start, end } = getPeriodRange(periodFilter);
      const data = await get<FinanceiroRecord>(TABLE, {
        select: SELECT_COLUMNS,
        filters: { user_id: userId, data: { gte: start, lte: end } },
        order: [
          { column: "data", ascending: false },
          { column: "created_at", ascending: false },
        ],
      });

      setAllRecords(data);
    } catch (error) {
      toast.error("Não foi possível carregar o financeiro", {
        description: getApiErrorMessage(error, "Tente atualizar a página novamente."),
      });
      console.error("Erro ao listar lançamentos financeiros:", error);
    } finally {
      setIsLoading(false);
    }
  }, [periodFilter]);

  const records = useMemo(
    () => (tipoFilter === "all" ? allRecords : allRecords.filter((record) => record.tipo === tipoFilter)),
    [allRecords, tipoFilter],
  );

  useEffect(() => {
    // The initial (and every filter-change) request owns its loading state inside fetchRecords.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchRecords();
  }, [fetchRecords]);

  async function createRecord(input: FinanceiroInput) {
    setIsSaving(true);

    try {
      const userId = await getAuthenticatedUserId();
      await post(TABLE, { ...input, descricao: input.descricao.trim() || null, user_id: userId });

      await fetchRecords();
      toast.success("Lançamento cadastrado");
      return true;
    } catch (error) {
      toast.error(
        isUniqueViolation(error) ? "Esse lançamento já foi importado" : "Não foi possível cadastrar o lançamento",
        {
          description: isUniqueViolation(error)
            ? "Essa transação do extrato já está no financeiro."
            : getApiErrorMessage(error, "Confira os dados e tente novamente."),
        },
      );
      console.error("Erro ao cadastrar lançamento financeiro:", error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  /** Entre os lançamentos informados, devolve os que já existem no financeiro (mesma data, valor e descrição). */
  async function findDuplicates(inputs: FinanceiroInput[]) {
    if (inputs.length === 0) return [] as FinanceiroInput[];

    try {
      const userId = await getAuthenticatedUserId();
      const dates = inputs.map((input) => input.data);
      const minDate = dates.reduce((min, date) => (date < min ? date : min));
      const maxDate = dates.reduce((max, date) => (date > max ? date : max));

      const data = await get<Pick<FinanceiroRecord, "data" | "valor" | "descricao">>(TABLE, {
        select: "data,valor,descricao",
        filters: { user_id: userId, data: { gte: minDate, lte: maxDate } },
      });

      const existingKeys = new Set(
        data.map((record) => duplicateKey(record.data, record.valor, record.descricao ?? "")),
      );

      return inputs.filter((input) => existingKeys.has(duplicateKey(input.data, input.valor, input.descricao)));
    } catch (error) {
      toast.error("Não foi possível checar lançamentos duplicados", {
        description: getApiErrorMessage(error, "Tente novamente em alguns instantes."),
      });
      console.error("Erro ao checar lançamentos duplicados:", error);
      return [];
    }
  }

  /** Insere vários lançamentos de uma vez (importação de OFX), pulando os que já foram importados (mesmo `fitid`). */
  async function importRecords(inputs: FinanceiroInput[]) {
    if (inputs.length === 0) return { inserted: 0, skipped: 0 };

    setIsSaving(true);

    try {
      const userId = await getAuthenticatedUserId();
      const rows = inputs.map((input) => ({ ...input, descricao: input.descricao.trim() || null, user_id: userId }));
      const data = await upsertIgnoring<{ id: string }>(TABLE, rows, { onConflict: "user_id,fitid", select: "id" });

      await fetchRecords();

      const inserted = data.length;
      const skipped = rows.length - inserted;
      toast.success(`${inserted} lançamento${inserted === 1 ? "" : "s"} importado${inserted === 1 ? "" : "s"}`, {
        description:
          skipped > 0
            ? `${skipped} já estava${skipped === 1 ? "" : "m"} no financeiro e ${skipped === 1 ? "foi ignorado" : "foram ignorados"}.`
            : undefined,
      });
      return { inserted, skipped };
    } catch (error) {
      toast.error("Não foi possível importar os lançamentos", {
        description: getApiErrorMessage(error, "Tente novamente em alguns instantes."),
      });
      console.error("Erro ao importar lançamentos do OFX:", error);
      return { inserted: 0, skipped: 0 };
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteRecord(id: string) {
    setDeletingId(id);

    try {
      const userId = await getAuthenticatedUserId();
      await remove(TABLE, { id, user_id: userId });

      setAllRecords((current) => current.filter((record) => record.id !== id));
      toast.success("Lançamento excluído");
      return true;
    } catch (error) {
      toast.error("Não foi possível excluir o lançamento", {
        description: getApiErrorMessage(error, "Tente novamente em alguns instantes."),
      });
      console.error("Erro ao excluir lançamento financeiro:", error);
      return false;
    } finally {
      setDeletingId(null);
    }
  }

  async function deleteRecords(ids: string[]) {
    if (ids.length === 0) return false;

    setIsBulkDeleting(true);

    try {
      const userId = await getAuthenticatedUserId();
      await remove(TABLE, { id: ids, user_id: userId });

      const idSet = new Set(ids);
      setAllRecords((current) => current.filter((record) => !idSet.has(record.id)));
      toast.success(`${ids.length} lançamento${ids.length === 1 ? "" : "s"} excluído${ids.length === 1 ? "" : "s"}`);
      return true;
    } catch (error) {
      toast.error("Não foi possível excluir os lançamentos", {
        description: getApiErrorMessage(error, "Tente novamente em alguns instantes."),
      });
      console.error("Erro ao excluir lançamentos financeiros em lote:", error);
      return false;
    } finally {
      setIsBulkDeleting(false);
    }
  }

  return {
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
    refreshRecords: fetchRecords,
  };
}
