"use client";

//* Libraries Imports
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

//* Services Imports
import { getOne, post, remove, rpc } from "@/services/api-service";
import { getAuthenticatedUserId } from "@/services/auth-service";

//* Utils Imports
import { getApiErrorMessage, isUniqueViolation } from "@/lib/api-error";
import { formatDuration, secondsSince } from "@/lib/format-duration";

export type TaskTimeEntryRecord = {
  id: string;
  user_id: string;
  task_id: string;
  started_at: string;
  ended_at: string | null;
  created_at: string;
};

export type TaskTimeTotais = { hojeSegundos: number; semanaSegundos: number; mesSegundos: number };

const SELECT_COLUMNS = "id,user_id,task_id,started_at,ended_at,created_at";

type TotaisResponse = {
  hoje_segundos: number | string;
  semana_segundos: number | string;
  mes_segundos: number | string;
};
type PorTarefaResponse = { task_id: string; segundos: number | string };
const TOTAIS_ZERADOS: TaskTimeTotais = { hojeSegundos: 0, semanaSegundos: 0, mesSegundos: 0 };

/** Fuso do navegador, com o Brasil como rede de segurança — os totais são agrupados por dia local. */
function getTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo";
}

/**
 * Cronômetro de execução de tarefas.
 *
 * O tempo decorrido nunca é acumulado no cliente: o `started_at` é gravado pelo Postgres e o
 * elapsed é sempre derivado dele. Por isso o cronômetro sobrevive a refresh, fechar a aba ou
 * trocar de dispositivo — e por isso não é preciso websocket nenhum.
 */
export function useTaskTimer() {
  const [runningEntry, setRunningEntry] = useState<TaskTimeEntryRecord | null>(null);
  const [secondsByTaskId, setSecondsByTaskId] = useState<Record<string, number>>({});
  const [totais, setTotais] = useState<TaskTimeTotais>(TOTAIS_ZERADOS);
  /**
   * Momento em que `totais` era exato. A UI soma o tempo decorrido daqui pra frente pra ticar ao
   * vivo — a RPC já embute o cronômetro em curso (via `coalesce(ended_at, now())`), então somar o
   * decorrido inteiro contaria o mesmo tempo duas vezes.
   */
  const [totaisAtualizadosEm, setTotaisAtualizadosEm] = useState(() => Date.now());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchTimer = useCallback(async () => {
    setIsLoading(true);

    try {
      const userId = await getAuthenticatedUserId();
      const [ativa, totaisResult, porTarefa] = await Promise.all([
        getOne<TaskTimeEntryRecord>("task_time_entries", {
          select: SELECT_COLUMNS,
          filters: { user_id: userId, ended_at: null },
        }),
        rpc<TotaisResponse[]>("task_time_totais", { p_timezone: getTimezone() }),
        rpc<PorTarefaResponse[]>("task_time_por_tarefa"),
      ]);

      setRunningEntry(ativa);

      const linhaTotais = (totaisResult ?? [])[0];
      setTotais(
        linhaTotais
          ? {
              hojeSegundos: Number(linhaTotais.hoje_segundos ?? 0),
              semanaSegundos: Number(linhaTotais.semana_segundos ?? 0),
              mesSegundos: Number(linhaTotais.mes_segundos ?? 0),
            }
          : TOTAIS_ZERADOS,
      );
      setTotaisAtualizadosEm(Date.now());

      setSecondsByTaskId(Object.fromEntries((porTarefa ?? []).map((linha) => [linha.task_id, Number(linha.segundos)])));
    } catch (error) {
      toast.error("Não foi possível carregar os cronômetros", {
        description: getApiErrorMessage(error, "Tente atualizar a página novamente."),
      });
      console.error("Erro ao carregar cronômetros:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // The initial request owns its loading state inside fetchTimer.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchTimer();
  }, [fetchTimer]);

  // Sem Realtime: outra aba pode ter iniciado/parado um cronômetro. Resincroniza quando esta aba
  // volta a ficar visível, que é exatamente o momento em que o usuário perceberia a diferença.
  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible") void fetchTimer();
    }

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [fetchTimer]);

  /** Finaliza o cronômetro ativo no servidor. Devolve os segundos gravados, ou null se nada rodava. */
  async function finalizarNoServidor() {
    const data = await rpc<TaskTimeEntryRecord | TaskTimeEntryRecord[] | null>("task_time_finalizar");
    const entrada = Array.isArray(data) ? (data[0] ?? null) : data;
    if (!entrada?.ended_at) return null;

    const segundos = Math.max(
      0,
      Math.floor((new Date(entrada.ended_at).getTime() - new Date(entrada.started_at).getTime()) / 1000),
    );
    return { taskId: entrada.task_id, segundos };
  }

  function aplicarSegundos(taskId: string, segundos: number) {
    setSecondsByTaskId((current) => ({ ...current, [taskId]: (current[taskId] ?? 0) + segundos }));
    setTotais((current) => ({
      hojeSegundos: current.hojeSegundos + segundos,
      semanaSegundos: current.semanaSegundos + segundos,
      mesSegundos: current.mesSegundos + segundos,
    }));
  }

  async function stopTimer() {
    if (!runningEntry) return true;

    setIsSaving(true);

    try {
      const finalizado = await finalizarNoServidor();
      setRunningEntry(null);

      if (finalizado) {
        aplicarSegundos(finalizado.taskId, finalizado.segundos);
        toast.success(`Tempo registrado: ${formatDuration(finalizado.segundos)}`);
      }

      // Reconcilia com os números autoritativos do banco (o otimista acima é só pra UI responder na hora).
      void fetchTimer();
      return true;
    } catch (error) {
      toast.error("Não foi possível finalizar o cronômetro", {
        description: getApiErrorMessage(error, "Tente novamente em alguns instantes."),
      });
      console.error("Erro ao finalizar cronômetro:", error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function startTimer(taskId: string) {
    if (runningEntry?.task_id === taskId) return true;

    setIsSaving(true);

    try {
      const userId = await getAuthenticatedUserId();

      // Só um cronômetro por vez: finaliza o anterior antes, pra restrição do banco nunca aparecer pro usuário.
      if (runningEntry) {
        const finalizado = await finalizarNoServidor();
        setRunningEntry(null);
        if (finalizado) {
          aplicarSegundos(finalizado.taskId, finalizado.segundos);
          toast.info(`Cronômetro anterior finalizado: ${formatDuration(finalizado.segundos)}`);
        }
      }

      // `started_at` é omitido de propósito — o default `now()` da coluna usa o relógio do servidor.
      const [entrada] = await post<TaskTimeEntryRecord>(
        "task_time_entries",
        { user_id: userId, task_id: taskId },
        { select: SELECT_COLUMNS },
      );

      setRunningEntry(entrada);
      // Cronômetro novo nasce com zero decorrido, então os totais estão exatos agora.
      setTotaisAtualizadosEm(Date.now());
      return true;
    } catch (error) {
      if (isUniqueViolation(error)) {
        toast.error("Já existe um cronômetro rodando", {
          description: "Atualizamos a tela com o estado mais recente.",
        });
        void fetchTimer();
      } else {
        toast.error("Não foi possível iniciar o cronômetro", {
          description: getApiErrorMessage(error, "Tente novamente em alguns instantes."),
        });
      }
      console.error("Erro ao iniciar cronômetro:", error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  /** Apaga o cronômetro ativo sem registrar tempo — a saída pro "deixei rodando o fim de semana". */
  async function discardTimer() {
    if (!runningEntry) return true;

    setIsSaving(true);

    try {
      const userId = await getAuthenticatedUserId();
      await remove("task_time_entries", { id: runningEntry.id, user_id: userId });
      setRunningEntry(null);
      toast.success("Cronômetro descartado");
      return true;
    } catch (error) {
      toast.error("Não foi possível descartar o cronômetro", {
        description: getApiErrorMessage(error, "Tente novamente em alguns instantes."),
      });
      console.error("Erro ao descartar cronômetro:", error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  return {
    runningEntry,
    runningTaskId: runningEntry?.task_id ?? null,
    runningStartedAt: runningEntry?.started_at ?? null,
    /** Segundos já gravados por tarefa; o cronômetro em curso não entra até ser finalizado. */
    secondsByTaskId,
    totais,
    totaisAtualizadosEm,
    isLoading,
    isSaving,
    startTimer,
    stopTimer,
    discardTimer,
    refreshTimer: fetchTimer,
    secondsSince,
  };
}
