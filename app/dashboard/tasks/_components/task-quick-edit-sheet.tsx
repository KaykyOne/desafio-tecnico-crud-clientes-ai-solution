"use client";

//* Libraries Imports
import { Check, Play, Square, Trash2 } from "lucide-react";

//* Components Imports
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SelectContent, SelectItem, SelectRoot, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SheetContent, SheetDescription, SheetHeader, SheetRoot, SheetTitle } from "@/components/ui/sheet";

//* Types Imports
import type { ClientRecord } from "@/hooks/use-clients";
import type { TaskColumnRecord } from "@/hooks/use-task-columns";
import type { TaskPriority, TaskQuickPatch, TaskRecord } from "@/hooks/use-tasks";

//* Utils Imports
import { formatDuration } from "@/lib/format-duration";
import { cn } from "@/lib/utils";

import TaskTimerDisplay from "./task-timer-display";
import type { TaskTimerProps } from "./task-card";

type TaskQuickEditSheetProps = {
  task: TaskRecord;
  clients: ClientRecord[];
  columns: TaskColumnRecord[];
  timer: TaskTimerProps & { onDiscard: () => void };
  onOpenChange: (open: boolean) => void;
  onPatch: (id: string, patch: TaskQuickPatch) => Promise<boolean>;
  onMoveToColumn: (id: string, columnId: string) => Promise<boolean>;
};

const priorityOptions: { value: TaskPriority; label: string; style: string }[] = [
  { value: "low", label: "Baixa", style: "border-zinc-950 bg-zinc-950 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950" },
  { value: "medium", label: "Média", style: "border-amber-400 bg-amber-400 text-amber-950" },
  { value: "high", label: "Urgente", style: "border-red-600 bg-red-600 text-white dark:border-red-500 dark:bg-red-500" },
];

export default function TaskQuickEditSheet({
  task,
  clients,
  columns,
  timer,
  onOpenChange,
  onPatch,
  onMoveToColumn,
}: TaskQuickEditSheetProps) {
  const selectedClient = clients.find((client) => client.id === task.cliente_id);
  const selectedColumn = columns.find((column) => column.id === task.column_id);
  const isRunning = timer.runningTaskId === task.id;
  const loggedSeconds = timer.secondsByTaskId[task.id] ?? 0;

  return (
    <SheetRoot open onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-6 p-6 sm:max-w-sm">
        <SheetHeader className="p-0">
          <SheetTitle className="text-lg font-bold tracking-[-0.03em]">Edição rápida</SheetTitle>
          <SheetDescription className="line-clamp-2">{task.title}</SheetDescription>
        </SheetHeader>

        <div className="space-y-3 rounded-xl border bg-muted p-4">
          <Label>Execução</Label>
          {isRunning && timer.runningStartedAt ? (
            <>
              <div className="flex items-center gap-2">
                <span className="size-2 animate-pulse rounded-full bg-emerald-600" />
                <TaskTimerDisplay
                  key={timer.runningStartedAt}
                  startedAt={timer.runningStartedAt}
                  className="text-2xl font-black tracking-[-0.04em]"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" disabled={timer.isSaving} onClick={timer.onStop}>
                  <Square />
                  Finalizar
                </Button>
                {/* Saída pro "esqueci rodando o fim de semana" — Finalizar salvaria as 60 horas. */}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  disabled={timer.isSaving}
                  onClick={timer.onDiscard}
                >
                  <Trash2 />
                  Descartar
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button type="button" size="sm" disabled={timer.isSaving} onClick={() => timer.onStart(task.id)}>
                <Play />
                Iniciar execução
              </Button>
              <p className="text-xs text-muted-foreground">
                Estimado: {task.average_duration_minutes} min
                {loggedSeconds > 0 && ` · já registrado: ${formatDuration(loggedSeconds)}`}
              </p>
            </>
          )}
        </div>

        {/* No celular, mover é a necessidade mais comum — e este é o caminho sem arrastar. */}
        <div className="space-y-3">
          <Label>Coluna</Label>
          <SelectRoot value={task.column_id} onValueChange={(value) => value && void onMoveToColumn(task.id, value)}>
            <SelectTrigger className="h-11 w-full bg-background">
              <SelectValue>{selectedColumn?.name ?? "—"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {columns.map((column) => (
                <SelectItem key={column.id} value={column.id}>
                  {column.name}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
        </div>

        <div className="space-y-3">
          <Label>Prioridade</Label>
          <div className="flex flex-col gap-2">
            {priorityOptions.map((option) => {
              const isSelected = task.priority === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => void onPatch(task.id, { priority: option.value })}
                  aria-pressed={isSelected}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent/50",
                    isSelected && "border-foreground/30 bg-accent/60",
                  )}
                >
                  <Badge variant="outline" className={cn("shrink-0", option.style)}>
                    {option.label}
                  </Badge>
                  {isSelected && <Check className="size-4 shrink-0 text-muted-foreground" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Cliente</Label>
          <SelectRoot
            value={task.cliente_id ?? "none"}
            onValueChange={(value) => void onPatch(task.id, { cliente_id: value === "none" ? null : value })}
          >
            <SelectTrigger className="h-11 w-full bg-background">
              <SelectValue>{selectedClient?.name ?? "Nenhum"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
          {clients.length === 0 && (
            <p className="text-xs text-muted-foreground">Você ainda não cadastrou nenhum cliente.</p>
          )}
        </div>

        <p className="mt-auto text-xs text-muted-foreground">As alterações são salvas automaticamente.</p>
      </SheetContent>
    </SheetRoot>
  );
}
