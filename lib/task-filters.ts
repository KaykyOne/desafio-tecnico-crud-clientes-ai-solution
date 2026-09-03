//* Types Imports
import type { TaskPriority, TaskRecord } from "@/hooks/use-tasks";

/**
 * Valor dos filtros do quadro de tarefas.
 *
 * Para adicionar um filtro novo depois: acrescente o campo aqui, o valor vazio em
 * `EMPTY_TASK_FILTERS`, a regra em `filterTasks` e o controle na barra (`TaskFilters`).
 * Cada filtro é independente dos outros — eles se combinam com E.
 */
export type TaskFilterValue = {
  /** Ids de cliente; `SEM_CLIENTE` representa as tarefas sem cliente. */
  clienteIds: string[];
  priorities: TaskPriority[];
  /** Domingo da semana filtrada, "YYYY-MM-DD". `null` = qualquer semana. */
  weekStart: string | null;
  /** Busca por título ou descrição. */
  searchText: string;
};

export const SEM_CLIENTE = "sem-cliente";

export const EMPTY_TASK_FILTERS: TaskFilterValue = {
  clienteIds: [],
  priorities: [],
  weekStart: null,
  searchText: "",
};

export const taskPriorityLabels: Record<TaskPriority, string> = {
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

function addDays(isoDate: string, days: number) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return toIsoDate(new Date(year, month - 1, day + days));
}

/** Domingo da semana que contém a data. Domingo por decisão de projeto (calendário brasileiro). */
export function getWeekStart(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  start.setDate(start.getDate() - start.getDay());
  return toIsoDate(start);
}

export function shiftWeek(weekStart: string, delta: number) {
  const [year, month, day] = weekStart.split("-").map(Number);
  return toIsoDate(new Date(year, month - 1, day + delta * 7));
}

/** Sábado da semana que começa em `weekStart`. */
export function getWeekEnd(weekStart: string) {
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

    if (filters.searchText) {
      const query = filters.searchText.toLowerCase();
      const titleMatch = task.title.toLowerCase().includes(query);
      const descriptionMatch = task.description?.toLowerCase().includes(query) ?? false;
      if (!titleMatch && !descriptionMatch) return false;
    }

    return true;
  });
}

export function countActiveFilters(filters: TaskFilterValue) {
  return (
    filters.clienteIds.length +
    filters.priorities.length +
    (filters.weekStart ? 1 : 0) +
    (filters.searchText ? 1 : 0)
  );
}
