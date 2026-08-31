"use client";

//* Components Imports
import Button from "@/components/ui/button";

import { FacetedFilter } from "./faceted-filter";
import { WeekFilter } from "./week-filter";

//* Libraries Imports
import { ListFilter, X } from "lucide-react";

//* Types Imports
import type { ClientRecord } from "@/hooks/use-clients";
import type { TaskPriority } from "@/hooks/use-tasks";
import type { TaskFilterValue } from "@/lib/task-filters";

//* Utils Imports
import { EMPTY_TASK_FILTERS, SEM_CLIENTE, countActiveFilters, taskPriorityLabels } from "@/lib/task-filters";

type TaskFiltersProps = {
  value: TaskFilterValue;
  clients: ClientRecord[];
  onChange: (value: TaskFilterValue) => void;
};

export function TaskFilters({ value, clients, onChange }: TaskFiltersProps) {
  const activeCount = countActiveFilters(value);

  const clientOptions = [
    ...clients.map((client) => ({ value: client.id, label: client.name })),
    { value: SEM_CLIENTE, label: "Sem cliente" },
  ];

  const priorityOptions = (Object.keys(taskPriorityLabels) as TaskPriority[]).map((priority) => ({
    value: priority,
    label: taskPriorityLabels[priority],
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
