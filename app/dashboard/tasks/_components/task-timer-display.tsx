"use client";

//* Libraries Imports
import { useEffect, useState } from "react";

//* Utils Imports
import { formatStopwatch, secondsSince } from "@/lib/format-duration";

type TaskTimerDisplayProps = {
  startedAt: string;
  className?: string;
};

/**
 * Mostra o tempo decorrido, atualizando a cada segundo.
 *
 * É um componente folha de propósito: se o contador morasse no `useTaskTimer` (montado no nível da
 * página), um setState por segundo re-renderizaria o quadro inteiro — inclusive no meio de um
 * arrasto, brigando com o dnd-kit. Aqui só este nó re-renderiza.
 *
 * Cada tick recalcula a partir do `startedAt` em vez de incrementar um contador, então o número
 * continua certo mesmo quando o navegador estrangula o timer numa aba em segundo plano.
 *
 * Use sempre com `key={startedAt}`: assim um cronômetro novo remonta o componente e o estado
 * inicial já nasce correto, sem precisar sincronizar via efeito.
 */
export default function TaskTimerDisplay({ startedAt, className }: TaskTimerDisplayProps) {
  const [seconds, setSeconds] = useState(() => secondsSince(startedAt));

  useEffect(() => {
    const interval = setInterval(() => setSeconds(secondsSince(startedAt)), 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  return (
    <span className={className} aria-live="off">
      {formatStopwatch(seconds)}
    </span>
  );
}
