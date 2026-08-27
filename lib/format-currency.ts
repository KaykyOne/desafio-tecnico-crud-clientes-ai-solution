/** Formata um valor numérico como moeda brasileira (R$ 1.234,56). */
export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}
