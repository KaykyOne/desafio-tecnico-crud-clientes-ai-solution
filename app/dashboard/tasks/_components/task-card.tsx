"use client";

//* Libraries Imports
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";
import { ArrowRightLeft, CalendarDays, Clock3, Pencil, Play, Square, Timer, Trash2, User } from "lucide-react";

//* Components Imports
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

//* Types Imports
import type { TaskPriority, TaskRecord } from "@/hooks/use-tasks";

//* Utils Imports
import { formatDateLong } from "@/lib/format-date";
import { formatDuration } from "@/lib/format-duration";
import { cn } from "@/lib/utils";

import TaskTimerDisplay from "./task-timer-display";

/** Agrupado num prop só porque atravessa 4 níveis até chegar no card. */
export type TaskTimerProps = {
  runningTaskId: string | null;
  runningStartedAt: string | null;
  secondsByTaskId: Record<string, number>;
  isSaving: boolean;
  onStart: (taskId: string) => void;
  onStop: () => void;
};

type TaskCardProps = {
  task: TaskRecord;
  clientName?: string;
  isDragging?: boolean;
  draggableAttributes?: DraggableAttributes;
  draggableListeners?: DraggableSyntheticListeners;
  timer?: TaskTimerProps;
  onEdit?: (task: TaskRecord) => void;
  onDelete?: (task: TaskRecord) => void;
  onQuickEdit?: (task: TaskRecord) => void;
};

const priorityLabels: Record<TaskPriority, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Urgente",
};
const priorityCardStyles: Record<TaskPriority, string> = {
  low: "border-zinc-950 bg-zinc-950 text-white dark:border-zinc-950 dark:bg-zinc-950 dark:text-white",
  medium: "border-amber-400 bg-amber-400 text-amber-950 dark:border-amber-400 dark:bg-amber-400 dark:text-amber-950",
  high: "border-red-600 bg-red-600 text-white dark:border-red-500 dark:bg-red-500 dark:text-white",
};
const priorityBadgeStyles: Record<TaskPriority, string> = {
  low: "border-white/40 bg-white/15 text-white",
  medium: "border-amber-950/30 bg-amber-950/10 text-amber-950",
  high: "border-white/40 bg-white/15 text-white",
};
const priorityMutedTextStyles: Record<TaskPriority, string> = {
  low: "text-white/75",
  medium: "text-amber-950/75",
  high: "text-white/80",
};
const priorityDividerStyles: Record<TaskPriority, string> = {
  low: "border-white/20",
  medium: "border-amber-950/20",
  high: "border-white/25",
};

// Executando: o card assume o azul e ignora a cor da prioridade, pra dar pra ver de longe o que
// está rodando. Como o azul é fundo escuro com texto branco, os detalhes reaproveitam as
// variantes da prioridade "low", que já são feitas pra esse contraste.
const runningCardStyle = "border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500 dark:text-white";

export default function TaskCard({
  task,
  clientName,
  isDragging,
  draggableAttributes,
  draggableListeners,
  timer,
  onEdit,
  onDelete,
  onQuickEdit,
}: TaskCardProps) {
  const isRunning = timer?.runningTaskId === task.id;
  const loggedSeconds = timer?.secondsByTaskId[task.id] ?? 0;
  // Enquanto executa, os detalhes seguem a paleta clara-sobre-escuro da prioridade "low".
  const detailPriority: TaskPriority = isRunning ? "low" : task.priority;

  return (
    <article
      {...draggableAttributes}
      {...draggableListeners}
      className={cn(
        "group rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring",
        isRunning ? runningCardStyle : priorityCardStyles[task.priority],
        // Sem `touch-none`: os listeners cobrem o card inteiro, então ele diria ao navegador
        // "nunca role a partir daqui" e a página travaria no celular. Com o TouchSensor por
        // atraso, o navegador precisa mesmo ser dono do gesto até a ativação.
        draggableListeners && "cursor-grab touch-manipulation active:cursor-grabbing",
        isDragging && "opacity-40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 font-semibold leading-snug">{task.title}</h3>
        <Badge
          variant="outline"
          {...(onQuickEdit
            ? {
                render: <button type="button" />,
                onClick: () => onQuickEdit(task),
                "aria-label": `Alterar prioridade e cliente de ${task.title}`,
                title: "Alterar prioridade e cliente",
              }
            : {})}
          className={cn(
            "shrink-0",
            priorityBadgeStyles[detailPriority],
            onQuickEdit && "cursor-pointer hover:brightness-110",
          )}
        >
          {priorityLabels[task.priority]}
        </Badge>
      </div>

      {task.description && (
        <p className={cn("mt-2 line-clamp-2 text-sm leading-relaxed", priorityMutedTextStyles[detailPriority])}>
          {task.description}
        </p>
      )}

      <div
        className={cn(
          "mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs",
          priorityMutedTextStyles[detailPriority],
        )}
      >
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-3.5" />
          Entrega: {formatDateLong(task.due_date)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="size-3.5" />
          Est.: {task.average_duration_minutes} min
        </span>
        {isRunning && timer?.runningStartedAt ? (
          <span className="inline-flex items-center gap-1.5 font-bold">
            <span className="size-1.5 animate-pulse rounded-full bg-current" />
            <TaskTimerDisplay key={timer.runningStartedAt} startedAt={timer.runningStartedAt} />
          </span>
        ) : (
          loggedSeconds > 0 && (
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <Timer className="size-3.5" />
              Real: {formatDuration(loggedSeconds)}
            </span>
          )
        )}
        {clientName && (
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <User className="size-3.5 shrink-0" />
            <span className="truncate">{clientName}</span>
          </span>
        )}
      </div>

      {(onEdit || onDelete || onQuickEdit || timer) && (
        <div
          className={cn(
            "mt-3 flex items-center justify-end gap-1 border-t pt-2 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100",
            priorityDividerStyles[detailPriority],
            // Com um cronômetro rodando a linha precisa ficar visível sem hover —
            // senão, no desktop, não há como pará-lo.
            isRunning && "sm:opacity-100",
            timer && "justify-between",
          )}
        >
          {timer && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={timer.isSaving}
              onClick={(event) => {
                event.stopPropagation();
                if (isRunning) timer.onStop();
                else timer.onStart(task.id);
              }}
              aria-label={isRunning ? `Finalizar execução de ${task.title}` : `Iniciar execução de ${task.title}`}
            >
              {isRunning ? <Square /> : <Play />}
            </Button>
          )}

          <div className="flex items-center">
          {/* Os botões vivem dentro do elemento que carrega os listeners de arrasto, então o
              stopPropagation é explícito — sem ele o clique compete com a ativação do sensor. */}
          {onQuickEdit && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={(event) => {
                event.stopPropagation();
                onQuickEdit(task);
              }}
              aria-label={`Mover ${task.title} ou alterar prioridade`}
            >
              <ArrowRightLeft />
            </Button>
          )}
          {onEdit && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={(event) => {
                event.stopPropagation();
                onEdit(task);
              }}
              aria-label={`Editar ${task.title}`}
            >
              <Pencil />
            </Button>
          )}
          {onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(task);
              }}
              aria-label={`Excluir ${task.title}`}
            >
              <Trash2 />
            </Button>
          )}
          </div>
        </div>
      )}
    </article>
  );
}
