"use client";

//* Services Imports
import { http } from "@/lib/http";

/**
 * Operações genéricas contra a API.
 *
 * Nenhum hook monta URL ou header por conta própria: todos passam por estas funções. Cada uma
 * traduz uma intenção simples ("busque estas colunas com estes filtros") para o dialeto do
 * PostgREST, que é o que o Supabase expõe.
 */

/** Filtros de uma consulta. O valor `null` vira `is.null`, arrays viram `in.(...)`. */
export type QueryFilters = Record<string, FilterValue | undefined>;

/** Operadores de comparação. Podem ser combinados no mesmo objeto (ex.: `{ gte, lte }` = intervalo). */
export type FilterOperators = {
  gte?: string | number;
  lte?: string | number;
  gt?: string | number;
  lt?: string | number;
  neq?: string | number;
  like?: string;
};

export type FilterValue = string | number | boolean | null | string[] | FilterOperators;

export type QueryOptions = {
  /** Colunas a retornar. Sem isso o PostgREST devolve a linha inteira. */
  select?: string;
  filters?: QueryFilters;
  /** Ordenação, aplicada na ordem do array. */
  order?: { column: string; ascending?: boolean }[];
  limit?: number;
};

/**
 * Traduz um valor de filtro para o dialeto do PostgREST.
 *
 * Devolve uma lista porque um objeto de operadores pode virar mais de um parâmetro — e é assim que
 * se expressa um intervalo (`data=gte.X&data=lte.Y`), que o servidor combina com E.
 */
function serializeFilter(value: Exclude<FilterValue, undefined>): string[] {
  if (value === null) return ["is.null"];
  if (Array.isArray(value)) return [`in.(${value.map((item) => `"${item}"`).join(",")})`];
  if (typeof value === "object") {
    return Object.entries(value)
      .filter(([, operand]) => operand !== undefined)
      .map(([operator, operand]) => `${operator}.${operand}`);
  }
  return [`eq.${value}`];
}

function buildParams({ select, filters, order, limit }: QueryOptions) {
  const params = new URLSearchParams();

  if (select) params.set("select", select);

  for (const [column, value] of Object.entries(filters ?? {})) {
    if (value === undefined) continue;
    for (const serialized of serializeFilter(value)) params.append(column, serialized);
  }

  if (order?.length) {
    params.set(
      "order",
      order.map(({ column, ascending }) => `${column}.${ascending === false ? "desc" : "asc"}`).join(","),
    );
  }

  if (limit !== undefined) params.set("limit", String(limit));

  return params;
}

/** Lista registros de uma tabela. */
export async function get<T>(table: string, options: QueryOptions = {}): Promise<T[]> {
  const { data } = await http.get<T[]>(`/${table}`, { params: buildParams(options) });
  return data ?? [];
}

/** Busca no máximo um registro. Devolve `null` quando não encontra — nunca lança por ausência. */
export async function getOne<T>(table: string, options: QueryOptions = {}): Promise<T | null> {
  const rows = await get<T>(table, { ...options, limit: 1 });
  return rows[0] ?? null;
}

/** Insere um ou vários registros e devolve o que foi gravado. */
export async function post<T>(table: string, body: object | object[], options: { select?: string } = {}): Promise<T[]> {
  const { data } = await http.post<T[]>(`/${table}`, body, {
    params: buildParams({ select: options.select ?? "*" }),
    headers: { Prefer: "return=representation" },
  });
  return data ?? [];
}

/**
 * Insere ou atualiza pela constraint indicada em `onConflict`.
 *
 * Linha que já existe é atualizada com os campos enviados; linha nova é inserida. Útil pra gravar
 * uma lista inteira de uma vez, como a reordenação de colunas.
 */
export async function upsert<T>(
  table: string,
  body: object[],
  options: { onConflict: string; select?: string },
): Promise<T[]> {
  const params = buildParams({ select: options.select ?? "*" });
  params.set("on_conflict", options.onConflict);

  const { data } = await http.post<T[]>(`/${table}`, body, {
    params,
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
  });
  return data ?? [];
}

/**
 * Insere ignorando conflitos com uma constraint única.
 *
 * `onConflict` nomeia as colunas da constraint; as linhas que colidirem são simplesmente puladas,
 * e o retorno traz só as que entraram de fato.
 */
export async function upsertIgnoring<T>(
  table: string,
  body: object[],
  options: { onConflict: string; select?: string },
): Promise<T[]> {
  const params = buildParams({ select: options.select ?? "*" });
  params.set("on_conflict", options.onConflict);

  const { data } = await http.post<T[]>(`/${table}`, body, {
    params,
    headers: { Prefer: "resolution=ignore-duplicates,return=representation" },
  });
  return data ?? [];
}

/** Atualiza os registros que casam com os filtros. */
export async function patch<T>(
  table: string,
  body: object,
  filters: QueryFilters,
  options: { select?: string } = {},
): Promise<T[]> {
  const { data } = await http.patch<T[]>(`/${table}`, body, {
    params: buildParams({ select: options.select ?? "*", filters }),
    headers: { Prefer: "return=representation" },
  });
  return data ?? [];
}

/** Remove os registros que casam com os filtros. */
export async function remove(table: string, filters: QueryFilters): Promise<void> {
  await http.delete(`/${table}`, { params: buildParams({ filters }) });
}

/** Chama uma função do banco (RPC). */
export async function rpc<T>(functionName: string, args: object = {}): Promise<T> {
  const { data } = await http.post<T>(`/rpc/${functionName}`, args);
  return data;
}
