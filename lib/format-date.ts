/**
 * Formata uma data no formato "YYYY-MM-DD" como dd/mm/aaaa.
 *
 * O `T00:00:00` é obrigatório: sem ele o JS interpreta a string como UTC e,
 * em fuso negativo como o do Brasil, a data volta um dia.
 */
export function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(`${date}T00:00:00`));
}

/** Mesma data por extenso abreviado (ex.: 26 de ago. de 2026). */
export function formatDateLong(date: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(`${date}T00:00:00`));
}

/**
 * Formata um timestamp completo (`timestamptz` do Supabase) como dd/mm/aaaa.
 *
 * Diferente de `formatDate`: aqui a string já traz hora e fuso, então não se
 * anexa `T00:00:00` — isso geraria uma data inválida.
 */
export function formatTimestamp(timestamp: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(timestamp));
}
