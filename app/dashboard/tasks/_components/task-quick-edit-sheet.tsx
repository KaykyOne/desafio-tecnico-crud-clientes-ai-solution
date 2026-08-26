"use client";

//* Libraries Imports
import { Check } from "lucide-react";

//* Components Imports
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { SelectContent, SelectItem, SelectRoot, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SheetContent, SheetDescription, SheetHeader, SheetRoot, SheetTitle } from "@/components/ui/sheet";

//* Types Imports
import type { ClientRecord } from "@/hooks/use-clients";
import type { TaskPriority, TaskQuickPatch, TaskRecord } from "@/hooks/use-tasks";

//* Utils Imports
import { cn } from "@/lib/utils";

type TaskQuickEditSheetProps = {
  task: TaskRecord;
  clients: ClientRecord[];
  onOpenChange: (open: boolean) => void;
  onPatch: (id: string, patch: TaskQuickPatch) => Promise<boolean>;
};

const priorityOptions: { value: TaskPriority; label: string; style: string }[] = [
  { value: "low", label: "Baixa", style: "border-zinc-950 bg-zinc-950 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950" },
  { value: "medium", label: "Média", style: "border-amber-400 bg-amber-400 text-amber-950" },
  { value: "high", label: "Urgente", style: "border-red-600 bg-red-600 text-white dark:border-red-500 dark:bg-red-500" },
];

export default function TaskQuickEditSheet({ task, clients, onOpenChange, onPatch }: TaskQuickEditSheetProps) {
  const selectedClient = clients.find((client) => client.id === task.cliente_id);

  return (
    <SheetRoot open onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-6 p-6 sm:max-w-sm">
        <SheetHeader className="p-0">
          <SheetTitle className="text-lg font-bold tracking-[-0.03em]">Edição rápida</SheetTitle>
          <SheetDescription className="line-clamp-2">{task.title}</SheetDescription>
        </SheetHeader>

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
