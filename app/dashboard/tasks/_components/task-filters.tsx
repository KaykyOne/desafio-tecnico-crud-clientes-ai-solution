"use client";

//* Libraries Imports
import { CalendarRange, Check, ChevronLeft, ChevronRight, ListFilter, PlusCircle, X } from "lucide-react";

//* Components Imports
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandRoot,
  CommandSeparator,
} from "@/components/ui/command";
import { PopoverContent, PopoverRoot, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

//* Types Imports
import type { ClientRecord } from "@/hooks/use-clients";
import type { TaskPriority, TaskRecord } from "@/hooks/use-tasks";

//* Utils Imports
import { cn } from "@/lib/utils";

/**
 * Valor dos filtros do quadro.
 *
 * Para adicionar um filtro novo depois: acrescente o campo aqui, o valor vazio em
 * `EMPTY_TASK_FILTERS`, a regra em `filterTasks` e o controle na barra. Cada filtro é
 * independente dos outros — eles se combinam com E.
 */
export type TaskFilterValue = {
  /** Ids de cliente; `SEM_CLIENTE` representa as tarefas sem cliente. */
  clienteIds: string[];
  priorities: TaskPriority[];
  /** Domingo da semana filtrada, "YYYY-MM-DD". `null` = qualquer semana. */
  weekStart: string | null;
};

export const SEM_CLIENTE = "sem-cliente";

export const EMPTY_TASK_FILTERS: TaskFilterValue = {
  clienteIds: [],
  priorities: [],
  weekStart: null,
};

const priorityLabels: Record<TaskPriority, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Urgente",
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Domingo da semana que contém a data. Domingo por decisão de projeto (calendário brasileiro). */
export function getWeekStart(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  start.setDate(start.getDate() - start.getDay());
  return toIsoDate(start);
}

export function shiftWeek(weekStart: string, delta: number) {
  const [year, month, day] = weekStart.split("-").map(Number);
  const date = new Date(year, month - 1, day + delta * 7);
  return toIsoDate(date);
}

function addDays(isoDate: string, days: number) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return toIsoDate(new Date(year, month - 1, day + days));
}

/** Sábado da semana que começa em `weekStart`. */
function getWeekEnd(weekStart: string) {
  return addDays(weekStart, 6);
}

function formatShort(isoDate: string) {
  const [, month, day] = isoDate.split("-");
  return `${day}/${month}`;
}

export function formatWeekRange(weekStart: string) {
  return `${formatShort(weekStart)} – ${formatShort(getWeekEnd(weekStart))}`;
}

/** Aplica todos os filtros ativos. Filtro vazio não restringe nada. */
export function filterTasks(tasks: TaskRecord[], filters: TaskFilterValue) {
  return tasks.filter((task) => {
    if (filters.clienteIds.length > 0) {
      const key = task.cliente_id ?? SEM_CLIENTE;
      if (!filters.clienteIds.includes(key)) return false;
    }

    if (filters.priorities.length > 0 && !filters.priorities.includes(task.priority)) return false;

    if (filters.weekStart) {
      const end = getWeekEnd(filters.weekStart);
      if (task.due_date < filters.weekStart || task.due_date > end) return false;
    }

    return true;
  });
}

export function countActiveFilters(filters: TaskFilterValue) {
  return filters.clienteIds.length + filters.priorities.length + (filters.weekStart ? 1 : 0);
}

type FacetedFilterProps = {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  emptyMessage?: string;
  onChange: (selected: string[]) => void;
};

/**
 * Filtro de múltipla escolha com busca (padrão "faceted filter" do shadcn: Popover + Command).
 * Genérico de propósito — qualquer filtro novo que seja "escolher de uma lista" reusa este.
 */
function FacetedFilter({ label, options, selected, emptyMessage = "Nada encontrado.", onChange }: FacetedFilterProps) {
  function toggle(value: string) {
    onChange(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
  }

  const selectedLabels = options.filter((option) => selected.includes(option.value));

  return (
    <PopoverRoot>
      <PopoverTrigger render={<Button type="button" variant="outline" size="sm" className="h-9 border-dashed" />}>
        <PlusCircle />
        {label}
        {selected.length > 0 && (
          <>
            <Separator orientation="vertical" className="mx-1 h-4" />
            {selectedLabels.length <= 2 ? (
              selectedLabels.map((option) => (
                <Badge key={option.value} variant="secondary" className="rounded-sm px-1 font-normal">
                  {option.label}
                </Badge>
              ))
            ) : (
              <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                {selected.length} selecionados
              </Badge>
            )}
          </>
        )}
      </PopoverTrigger>

      <PopoverContent align="start" className="w-56 p-0">
        <CommandRoot>
          <CommandInput placeholder={label} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <CommandItem key={option.value} value={option.label} onSelect={() => toggle(option.value)}>
                    <span
                      className={cn(
                        "flex size-4 items-center justify-center rounded-sm border",
                        isSelected ? "border-primary bg-primary text-primary-foreground" : "border-input",
                      )}
                    >
                      {isSelected && <Check className="size-3" />}
                    </span>
                    <span className="truncate">{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selected.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem value="__limpar" onSelect={() => onChange([])} className="justify-center">
                    Limpar
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </CommandRoot>
      </PopoverContent>
    </PopoverRoot>
  );
}

type WeekFilterProps = {
  weekStart: string | null;
  onChange: (weekStart: string | null) => void;
};

/** Filtro por semana de entrega, navegável. Semana começa no domingo. */
function WeekFilter({ weekStart, onChange }: WeekFilterProps) {
  if (!weekStart) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 border-dashed"
        onClick={() => onChange(getWeekStart(new Date()))}
      >
        <PlusCircle />
        Semana
      </Button>
    );
  }

  const isCurrentWeek = weekStart === getWeekStart(new Date());

  return (
    <div className="flex h-9 items-center gap-0.5 rounded-md border px-1">
      <CalendarRange className="mx-1 size-4 shrink-0 text-muted-foreground" />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => onChange(shiftWeek(weekStart, -1))}
        aria-label="Semana anterior"
      >
        <ChevronLeft />
      </Button>
      <span className="min-w-[6.5rem] text-center text-xs font-semibold tabular-nums">
        {isCurrentWeek ? "Esta semana" : formatWeekRange(weekStart)}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => onChange(shiftWeek(weekStart, 1))}
        aria-label="Próxima semana"
      >
        <ChevronRight />
      </Button>
      <Button type="button" variant="ghost" size="icon-sm" onClick={() => onChange(null)} aria-label="Remover filtro de semana">
        <X />
      </Button>
    </div>
  );
}

type TaskFiltersProps = {
  value: TaskFilterValue;
  clients: ClientRecord[];
  onChange: (value: TaskFilterValue) => void;
};

export default function TaskFilters({ value, clients, onChange }: TaskFiltersProps) {
  const activeCount = countActiveFilters(value);

  const clientOptions = [
    ...clients.map((client) => ({ value: client.id, label: client.name })),
    { value: SEM_CLIENTE, label: "Sem cliente" },
  ];

  const priorityOptions = (Object.keys(priorityLabels) as TaskPriority[]).map((priority) => ({
    value: priority,
    label: priorityLabels[priority],
  }));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
        <ListFilter className="size-3.5" />
        Filtros
      </span>

      <FacetedFilter
        label="Cliente"
        options={clientOptions}
        selected={value.clienteIds}
        emptyMessage="Nenhum cliente."
        onChange={(clienteIds) => onChange({ ...value, clienteIds })}
      />

      <FacetedFilter
        label="Prioridade"
        options={priorityOptions}
        selected={value.priorities}
        onChange={(priorities) => onChange({ ...value, priorities: priorities as TaskPriority[] })}
      />

      <WeekFilter weekStart={value.weekStart} onChange={(weekStart) => onChange({ ...value, weekStart })} />

      {activeCount > 0 && (
        <Button type="button" variant="ghost" size="sm" className="h-9" onClick={() => onChange(EMPTY_TASK_FILTERS)}>
          <X />
          Limpar
        </Button>
      )}
    </div>
  );
}
