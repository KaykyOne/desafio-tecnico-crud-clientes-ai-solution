"use client";

//* Components Imports
import Skeleton from "@/components/ui/skeleton";

//* Libraries Imports
import { useEffect, useState } from "react";

//* Types Imports
import type { TaskTimeTotais } from "@/hooks/use-task-timer";

//* Utils Imports
import { formatDuration, formatStopwatch } from "@/lib/format-duration";

type TaskTimeSummaryProps = {
  totais: TaskTimeTotais;
  /** Momento em que `totais` era exato; o extra ao vivo é contado a partir daqui. */
  totaisAtualizadosEm: number;
  isRunning: boolean;
  isLoading: boolean;
};

/**
 * Totais de tempo trabalhado, que continuam correndo enquanto houver um cronômetro ativo.
 *
 * O tick vive aqui dentro (e não no `useTaskTimer`, que é montado na página) pra que só estes três
 * cards re-renderizem por segundo — não o quadro inteiro, que estaria brigando com o dnd-kit no
 * meio de um arrasto.
 */
export function TaskTimeSummary({ totais, totaisAtualizadosEm, isRunning, isLoading }: TaskTimeSummaryProps) {
  // O baseline anda junto do valor pra que, quando ele muda (cronômetro novo, ou totais relidos do
  // servidor), a sobra do ciclo anterior não apareça no intervalo entre o render e o primeiro tick.
  const [tick, setTick] = useState({ baseline: totaisAtualizadosEm, segundos: 0 });

  useEffect(() => {
    if (!isRunning) return;

    // Cada tick recalcula a partir do baseline em vez de incrementar, então o número continua
    // certo mesmo depois de o navegador estrangular o timer numa aba em segundo plano.
    const interval = setInterval(
      () =>
        setTick({
          baseline: totaisAtualizadosEm,
          segundos: Math.max(0, Math.floor((Date.now() - totaisAtualizadosEm) / 1000)),
        }),
      1000,
    );
    return () => clearInterval(interval);
  }, [isRunning, totaisAtualizadosEm]);

  const extraSegundos = isRunning && tick.baseline === totaisAtualizadosEm ? tick.segundos : 0;

  const cards = [
    { label: "Trabalhado hoje", seconds: totais.hojeSegundos },
    { label: "Esta semana", seconds: totais.semanaSegundos },
    { label: "Este mês", seconds: totais.mesSegundos },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => {
        const seconds = card.seconds + extraSegundos;
        return (
          <div
            key={card.label}
            className={`rounded-2xl border p-5 transition-colors ${isRunning ? "border-blue-600/40 bg-blue-600/10" : "bg-muted"}`}
          >
            <p className="flex items-center gap-2 text-xs font-semibold text-foreground opacity-75">
              {card.label}
              {isRunning && <span className="size-1.5 animate-pulse rounded-full bg-blue-600" />}
            </p>
            {isLoading ? (
              <Skeleton className="mt-4 h-9 w-28" />
            ) : (
              <p className="mt-4 text-3xl font-black tracking-[-0.06em] text-foreground tabular-nums">
                {seconds === 0 ? "—" : isRunning ? formatStopwatch(seconds) : formatDuration(seconds)}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
